"""AI Routing Agent — dynamically routes complaint description to matching department from live DB list."""

import logging
from typing import List, Dict, Any
from app.agents.gemini_client import generate, clean_json_response, GeminiClientError

logger = logging.getLogger("civicos.agents.routing")


def route_to_department(
    description: str,
    service_name: str,
    departments: List[Dict[str, Any]],
) -> int:
    """Given complaint description & live departments list from DB, returns matching department_id."""
    if not departments:
        return 1

    valid_dept_ids = {d["id"] for d in departments}
    dept_summary = "\n".join(
        [f"- ID {d['id']}: {d['name']} ({d.get('description', '') or ''})" for d in departments]
    )

    system_prompt = (
        "You are a civic routing agent. Match the complaint to the best department ID from this list:\n"
        f"{dept_summary}\n"
        "Respond ONLY with strict JSON: {\"department_id\": <int>, \"reasoning\": \"one sentence\"}"
    )
    user_prompt = f"Service: {service_name}\nDescription: {description}"

    try:
        raw_resp = generate(user_prompt, system=system_prompt)
        content = clean_json_response(raw_resp)
        dept_id = int(content.get("department_id"))
        if dept_id in valid_dept_ids:
            print("[routing_agent] GEMINI")
            logger.info(f"[routing_agent] GEMINI: Routed to department_id={dept_id}")
            return dept_id
        else:
            logger.warning(f"[routing_agent] Department ID {dept_id} not in live org departments. Falling back.")
    except Exception as e:
        logger.warning(f"[routing_agent] Gemini call failed ({e}). Falling back to dynamic keyword matching.")

    # Dynamic fallback (kept intact)
    print("[routing_agent] FALLBACK")
    logger.info("[routing_agent] FALLBACK: Executing dynamic keyword matching Routing Agent.")
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
