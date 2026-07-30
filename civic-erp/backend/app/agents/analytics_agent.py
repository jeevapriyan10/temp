"""AI Analytics Insights Agent — summarizes real SQL stats into plain-English insights."""

import os
import json
import logging
import urllib.request
from typing import Dict, Any, List

logger = logging.getLogger("civicos.agents.analytics")


def generate_insights(summary_data: Dict[str, Any]) -> List[str]:
    """Given real SQL analytics summary dictionary, returns 3-4 plain English insight bullets."""
    total = summary_data.get("total_complaints", 0)
    status_counts = summary_data.get("status_counts", {})
    priority_counts = summary_data.get("priority_counts", {})
    dept_counts = summary_data.get("department_counts", [])
    avg_res_time = summary_data.get("avg_resolution_time_minutes", 0)

    api_key = os.getenv("AI_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY")

    if api_key:
        try:
            payload = {
                "model": os.getenv("AI_MODEL", "gpt-3.5-turbo"),
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an executive civic analytics AI agent. Given operational complaint metrics, return a JSON object: {\"insights\": [string, string, string, string]} containing 3-4 executive, data-grounded insights.",
                    },
                    {
                        "role": "user",
                        "content": f"Metrics Data: {json.dumps(summary_data)}",
                    },
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.2,
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
                return content.get("insights", [])
        except Exception as e:
            logger.warning(f"LLM API call failed ({e}). Falling back to rule-based insights generator.")

    # Rule-based fallback generating data-grounded text
    print("[AI AGENT WARNING]: AI_API_KEY not configured or unreachable. Executing data-grounded Analytics Agent.")
    insights = []

    # Insight 1: Total & Active Load
    active_load = status_counts.get("reported", 0) + status_counts.get("in_progress", 0) + status_counts.get("assigned", 0)
    insights.append(
        f"Overall complaint volume stands at {total} issues, with {active_load} active tasks currently in operational queue."
    )

    # Insight 2: Top Department
    if dept_counts:
        top_dept = max(dept_counts, key=lambda x: x.get("count", 0))
        if top_dept.get("count", 0) > 0:
            insights.append(
                f"'{top_dept.get('department_name')}' is currently receiving the highest workload ({top_dept.get('count')} logged complaints)."
            )
        else:
            insights.append("All city departments are currently maintaining low intake volume.")
    else:
        insights.append("No department workload anomalies detected across the organization.")

    # Insight 3: Critical Urgency
    crit_count = priority_counts.get("critical", 0) + priority_counts.get("high", 0)
    if crit_count > 0:
        insights.append(
            f"High & Critical priority tickets account for {crit_count} issues requiring immediate officer dispatch."
        )
    else:
        insights.append("Zero critical emergency hazards reported today across active zones.")

    # Insight 4: Resolution SLA
    if avg_res_time > 0:
        insights.append(
            f"Field officers are maintaining an average resolution time of {avg_res_time} minutes per complaint."
        )
    else:
        insights.append("Field SLA resolution time tracking is active for pending completed tasks.")

    return insights
