"""AI Priority Agent — classifies complaint severity with Gemini LLM or rule-based fallback."""

import logging
from app.agents.gemini_client import generate, clean_json_response, GeminiClientError

logger = logging.getLogger("civicos.agents.priority")

CRITICAL_KEYWORDS = ["fire", "explosion", "gas leak", "electric shock", "live wire", "sparking", "collapse", "hazard", "toxic", "biohazard", "emergency"]
HIGH_KEYWORDS = ["pothole", "burst", "water leak", "pipeline leak", "missed pickup", "blocked drain", "sewage", "outage", "transformer"]
MEDIUM_KEYWORDS = ["resurfacing", "low pressure", "connection", "toilet", "equipment repair", "street light", "damaged"]
LOW_KEYWORDS = ["tree trimming", "footpath", "park", "aesthetic", "cleanliness", "painting"]

ALLOWED_PRIORITIES = {"low", "medium", "high", "critical"}


def analyze_priority(description: str, service_name: str = "") -> tuple[str, str]:
    """Given description and service name, return (priority, reasoning)."""
    system_prompt = (
        "You are a civic operations AI triage agent. Analyze the civic issue description and "
        "respond ONLY with strict JSON: {\"priority\": \"low\"|\"medium\"|\"high\"|\"critical\", \"reasoning\": \"one sentence\"}"
    )
    user_prompt = f"Service: {service_name}\nDescription: {description}"

    try:
        raw_resp = generate(user_prompt, system=system_prompt)
        content = clean_json_response(raw_resp)
        priority = str(content.get("priority", "")).lower().strip()
        reasoning = str(content.get("reasoning", "Gemini classified priority.")).strip()

        if priority in ALLOWED_PRIORITIES:
            print("[priority_agent] GEMINI")
            logger.info("[priority_agent] GEMINI")
            return priority, reasoning
        else:
            logger.warning(f"[priority_agent] Invalid priority value from Gemini: '{priority}'. Falling back.")
    except Exception as e:
        logger.warning(f"[priority_agent] Gemini call failed ({e}). Falling back to rule-based classification.")

    # Rule-based fallback (kept intact)
    print("[priority_agent] FALLBACK")
    logger.info("[priority_agent] FALLBACK: Executing rule-based Priority Agent.")
    combined_text = f"{service_name} {description}".lower()

    if any(k in combined_text for k in CRITICAL_KEYWORDS):
        return "critical", "Rule Agent: Immediate safety/hazard keywords detected in complaint."
    if any(k in combined_text for k in HIGH_KEYWORDS):
        return "high", "Rule Agent: High-impact infrastructure issue detected."
    if any(k in combined_text for k in LOW_KEYWORDS):
        return "low", "Rule Agent: Standard non-urgent maintenance request."
    if any(k in combined_text for k in MEDIUM_KEYWORDS):
        return "medium", "Rule Agent: Regular operational issue detected."

    return "medium", "Rule Agent: Default priority assigned based on standard SLA."
