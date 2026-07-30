"""AI Routing Agent — dynamically routes complaint description to matching department from live DB list."""

import os
import json
import logging
import urllib.request
from typing import List, Dict, Any

logger = logging.getLogger("civicos.agents.routing")


def route_to_department(
    description: str,
    service_name: str,
    departments: List[Dict[str, Any]],
) -> int:
    """Given complaint description & live departments list from DB, returns the matching department_id."""
    if not departments:
        return 1

    api_key = os.getenv("AI_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY")

    dept_summary = "\n".join(
        [f"- ID {d['id']}: {d['name']} ({d.get('description', '')})" for d in departments]
    )

    if api_key:
        try:
            payload = {
                "model": os.getenv("AI_MODEL", "gpt-3.5-turbo"),
                "messages": [
                    {
                        "role": "system",
                        "content": f"You are a civic routing agent. Match the complaint to the best department ID from this list:\n{dept_summary}\nReturn JSON: {{\"department_id\": int, \"reasoning\": string}}",
                    },
                    {
                        "role": "user",
                        "content": f"Service: {service_name}\nDescription: {description}",
                    },
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.1,
            }
            req = urllib.request.Request(
                os.getenv("AI_API_ENDPOINT", "https://api.openai.com/v1/chat/completions"),
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                content = json.loads(res_data["choices"][0]["message"]["content"])
                return int(content.get("department_id", departments[0]["id"]))
        except Exception as e:
            logger.warning(f"LLM API call failed ({e}). Falling back to dynamic keyword matching.")

    # Dynamic fallback: Match words in description/service against department name & description
    print("[AI AGENT WARNING]: AI_API_KEY not configured or unreachable. Executing dynamic fallback Routing Agent.")
    query = f"{service_name} {description}".lower()

    best_dept_id = departments[0]["id"]
    highest_score = -1

    for d in departments:
        score = 0
        d_name = d["name"].lower()
        d_desc = (d.get("description") or "").lower()

        # Score exact name tokens
        for token in d_name.split():
            if len(token) > 2 and token in query:
                score += 5

        # Score description tokens
        for token in d_desc.split():
            if len(token) > 3 and token in query:
                score += 2

        if score > highest_score:
            highest_score = score
            best_dept_id = d["id"]

    return best_dept_id
