"""AI Duplicate Detection Agent — flags open complaints in same location/service within 7 days."""

import logging
from typing import List, Dict, Any, Tuple, Optional
from app.agents.gemini_client import generate, clean_json_response, GeminiClientError

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

    # First-pass DB query filter: open complaints matching location & service
    candidates = [
        c for c in open_complaints
        if c.get("location_id") == new_location_id and c.get("service_id") == new_service_id
    ]

    if not candidates:
        return False, None

    cand_summary = "\n".join(
        [f"- Complaint #{c['id']}: {c['description']}" for c in candidates]
    )

    system_prompt = (
        "You are a duplicate detection agent. Compare the new complaint description with existing open complaints at the same location:\n"
        f"{cand_summary}\n"
        "Respond ONLY with strict JSON: {\"is_duplicate\": true|false, \"matched_complaint_id\": <int or null>, \"reasoning\": \"one sentence\"}"
    )
    user_prompt = f"New Complaint Description: {new_description}"

    try:
        raw_resp = generate(user_prompt, system=system_prompt)
        content = clean_json_response(raw_resp)
        is_dup = bool(content.get("is_duplicate", False))
        matched_id = content.get("matched_complaint_id") or content.get("parent_complaint_id")
        if matched_id:
            matched_id = int(matched_id)

        print("[duplicate_agent] GEMINI")
        logger.info(f"[duplicate_agent] GEMINI: is_duplicate={is_dup}, matched_id={matched_id}")
        return is_dup, matched_id if is_dup else None
    except Exception as e:
        logger.warning(f"[duplicate_agent] Gemini call failed ({e}). Falling back to spatial/service matching.")

    # Rule-based fallback (kept intact)
    print("[duplicate_agent] FALLBACK")
    logger.info("[duplicate_agent] FALLBACK: Executing spatial/service Duplicate Agent.")
    parent_complaint = candidates[0]
    return True, parent_complaint["id"]
