"""AI Analytics Insights Agent — summarizes real SQL stats into plain-English insights."""

import logging
from typing import Dict, Any, List
from app.agents.gemini_client import generate, clean_json_response, GeminiClientError

logger = logging.getLogger("civicos.agents.analytics")


def generate_insights(summary_data: Dict[str, Any]) -> List[str]:
    """Given real SQL analytics summary dictionary, returns 3-4 plain English insight bullets."""
    total = summary_data.get("total_complaints", 0)
    status_counts = summary_data.get("status_counts", {})
    priority_counts = summary_data.get("priority_counts", {})
    dept_counts = summary_data.get("department_counts", [])
    avg_res_time = summary_data.get("avg_resolution_time_minutes", 0)

    system_prompt = (
        "You are an executive civic analytics AI agent. Given operational complaint metrics, "
        "respond ONLY with strict JSON: {\"insights\": [\"bullet 1\", \"bullet 2\", \"bullet 3\", \"bullet 4\"]} "
        "containing 3-4 executive, data-grounded insights."
    )
    user_prompt = f"Metrics Data: {summary_data}"

    try:
        raw_resp = generate(user_prompt, system=system_prompt)
        content = clean_json_response(raw_resp)
        insights = content.get("insights", [])
        if isinstance(insights, list) and len(insights) >= 2:
            print("[analytics_agent] GEMINI")
            logger.info("[analytics_agent] GEMINI: Generated fluent executive insights.")
            return insights
    except Exception as e:
        logger.warning(f"[analytics_agent] Gemini call failed ({e}). Falling back to rule-based insights generator.")

    # Rule-based fallback generating data-grounded text (kept intact)
    print("[analytics_agent] FALLBACK")
    logger.info("[analytics_agent] FALLBACK: Executing data-grounded Analytics Agent.")
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
