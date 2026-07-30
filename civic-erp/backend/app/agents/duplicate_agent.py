"""AI Duplicate Detection Agent — flags open complaints in same location/service within 7 days."""

import os
import json
import logging
import urllib.request
from typing import List, Dict, Any, Tuple, Optional

logger = logging.getLogger("civicos.agents.duplicate")


def detect_duplicate(
    new_location_id: int,
    new_service_id: int,
    new_description: str,
    open_complaints: List[Dict[str, Any]],
) -> Tuple[bool, Optional[int]]:
    """Given location_id, service_id, description, and candidate open complaints from DB.

    Returns (is_duplicate: bool, parent_complaint_id: int | None).
    """
    if not open_complaints:
        return False, None

    # Filter open complaints matching location & service
    candidates = [
        c for c in open_complaints
        if c.get("location_id") == new_location_id and c.get("service_id") == new_service_id
    ]

    if not candidates:
        return False, None

    api_key = os.getenv("AI_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY")

    if api_key:
        try:
            cand_summary = "\n".join(
                [f"- Complaint #{c['id']}: {c['description']}" for c in candidates]
            )
            payload = {
                "model": os.getenv("AI_MODEL", "gpt-3.5-turbo"),
                "messages": [
                    {
                        "role": "system",
                        "content": f"You are a duplicate detection agent. Compare the new complaint description with existing open complaints at the same location:\n{cand_summary}\nReturn JSON: {{\"is_duplicate\": bool, \"parent_complaint_id\": int|null}}",
                    },
                    {
                        "role": "user",
                        "content": f"New Complaint: {new_description}",
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
                return bool(content.get("is_duplicate", False)), content.get("parent_complaint_id")
        except Exception as e:
            logger.warning(f"LLM duplicate check failed ({e}). Falling back to spatial/service matching.")

    # Rule-based fallback: same location + same service open within last 7 days = duplicate
    print("[AI AGENT WARNING]: AI_API_KEY not configured or unreachable. Executing spatial/service Duplicate Agent.")
    parent_complaint = candidates[0]
    return True, parent_complaint["id"]
