"""AI Chatbot Agent — handles citizen Q&A on real services and specific complaint tracking."""

import json
import logging
import re
from typing import Dict, Any, List
from app.agents.gemini_client import generate, GeminiClientError

logger = logging.getLogger("civicos.agents.chatbot")


def process_chat_message(
    user_message: str,
    user_complaints: List[Dict[str, Any]],
    services_list: List[Dict[str, Any]],
) -> str:
    """Processes citizen query using real services context and live user complaint status."""
    message_lower = user_message.lower()

    # 1. Direct Complaint Status Query Check (e.g. "where is my complaint #1", "status of complaint 2")
    id_match = re.search(r"(?:complaint|ticket|issue|#)\s*#?(\d+)", message_lower)

    if id_match:
        target_id = int(id_match.group(1))
        matched_complaint = next((c for c in user_complaints if c["id"] == target_id), None)
        if matched_complaint:
            status_clean = matched_complaint["status"].replace("_", " ").title()
            officer_name = matched_complaint.get("officer", {}).get("name") if matched_complaint.get("officer") else "Unassigned"
            dept_name = matched_complaint.get("department", {}).get("name") if matched_complaint.get("department") else "Department"
            svc_name = matched_complaint.get("service", {}).get("name") if matched_complaint.get("service") else "Service"

            real_db_facts = (
                f"Complaint #{target_id} Details:\n"
                f"- Service: {svc_name}\n"
                f"- Department: {dept_name}\n"
                f"- Status: {status_clean}\n"
                f"- Assigned Officer: {officer_name}\n"
                f"- Description: {matched_complaint['description']}"
            )

            system_prompt = (
                "You are CivicOS Assistant. Wrap the provided real database complaint status facts "
                "into a polite, clear, structured citizen update. Do not alter any status details or hallucinate facts."
            )
            try:
                reply = generate(real_db_facts, system=system_prompt)
                print("[chatbot_agent] GEMINI")
                logger.info("[chatbot_agent] GEMINI: Wrapped complaint status update.")
                return reply
            except Exception as e:
                logger.warning(f"[chatbot_agent] Gemini call failed ({e}). Falling back to template response.")

            print("[chatbot_agent] FALLBACK")
            return (
                f"🔎 **Complaint #{target_id} Status Update**\n\n"
                f"• **Service:** {svc_name}\n"
                f"• **Department:** {dept_name}\n"
                f"• **Status:** {status_clean}\n"
                f"• **Assigned Officer:** {officer_name}\n"
                f"• **Description:** {matched_complaint['description']}\n\n"
                f"You can view full progress and history on the 'Track Issues' tab."
            )
        else:
            return f"I couldn't find complaint #{target_id} in your active records. Please check the ID or visit your 'Track Issues' page."

    # 2. General Service Inquiry or Conversational AI response
    context_services = "\n".join(
        [f"- {s['name']}: {s.get('description', '') or ''}" for s in services_list]
    )
    system_prompt = (
        "You are CivicOS Assistant, a helpful assistant for city citizens. "
        "Answer queries conversationally based on our available municipal services:\n"
        f"{context_services}\n"
        "Keep answers polite, concise, and helpful."
    )

    try:
        reply = generate(user_message, system=system_prompt)
        print("[chatbot_agent] GEMINI")
        logger.info("[chatbot_agent] GEMINI: Responded to general query.")
        return reply
    except Exception as e:
        logger.warning(f"[chatbot_agent] Gemini call failed ({e}). Falling back to rule-based Q&A response.")

    # Rule-based fallback Q&A (kept intact)
    print("[chatbot_agent] FALLBACK")
    logger.info("[chatbot_agent] FALLBACK: Executing rule-based Chatbot Agent.")

    if any(k in message_lower for k in ["road", "pothole", "footpath", "street"]):
        return "🛣️ **Road & Infrastructure Help**\nTo report a pothole, road resurfacing, or footpath repair, go to 'Report Issue', select the **Road & Infrastructure** department, choose your service, and provide the exact location."

    if any(k in message_lower for k in ["water", "leak", "pipeline", "pressure"]):
        return "💧 **Water Supply Help**\nTo report water pipeline leaks or low pressure complaints, select **Water Supply** on the 'Report Issue' form. High priority leaks are assigned immediately to on-duty engineers."

    if any(k in message_lower for k in ["garbage", "trash", "waste", "clean", "toilet"]):
        return "🗑️ **Sanitation Help**\nFor missed garbage pickup or drain cleaning requests, choose **Garbage & Sanitation** on the report page."

    if any(k in message_lower for k in ["track", "my issue", "list", "status"]):
        if user_complaints:
            comp_summaries = "\n".join([f"• #{c['id']} - {c.get('service', {}).get('name', 'Issue')} ({c['status'].replace('_', ' ').title()})" for c in user_complaints[:5]])
            return f"📋 **Your Recent Complaints**\n\n{comp_summaries}\n\nAsk me about a specific ID (e.g. 'where is complaint #{user_complaints[0]['id']}') for more details!"
        return "You have no active complaints logged currently. Use the 'Report Issue' page to log a new complaint."

    return "👋 Welcome to **CivicOS Citizen Assistant**! You can ask me how to report specific issues (e.g., road repair, water leaks, sanitation) or inquire about your complaint status by asking 'Where is complaint #1?'"
