"""AI Priority Agent — classifies complaint severity with LLM API or rule-based fallback."""

import os
import json
import logging
import urllib.request
import urllib.error

logger = logging.getLogger("civicos.agents.priority")

CRITICAL_KEYWORDS = ["fire", "explosion", "gas leak", "electric shock", "live wire", "sparking", "collapse", "hazard", "toxic", "biohazard", "emergency"]
HIGH_KEYWORDS = ["pothole", "burst", "water leak", "pipeline leak", "missed pickup", "blocked drain", "sewage", "outage", "transformer"]
MEDIUM_KEYWORDS = ["resurfacing", "low pressure", "connection", "toilet", "equipment repair", "street light", "damaged"]
LOW_KEYWORDS = ["tree trimming", "footpath", "park", "aesthetic", "cleanliness", "painting"]


def analyze_priority(description: str, service_name: str = "") -> tuple[str, str]:
    """Given description and service name, return (priority, reasoning)."""
    api_key = os.getenv("AI_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY")

    if api_key:
        try:
            # LLM API Call (OpenAI compatible endpoint)
            payload = {
                "model": os.getenv("AI_MODEL", "gpt-3.5-turbo"),
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a civic operations AI triage agent. Analyze the civic issue description and return a JSON object: {\"priority\": \"low\"|\"medium\"|\"high\"|\"critical\", \"reasoning\": \"short 1-sentence reason\"}",
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
                return content.get("priority", "medium").lower(), content.get("reasoning", "LLM classified priority.")
        except Exception as e:
            logger.warning(f"LLM API call failed ({e}). Falling back to rule-based classification.")

    # Rule-based fallback
    print("[AI AGENT WARNING]: AI_API_KEY not configured or unreachable. Executing rule-based Priority Agent.")
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
