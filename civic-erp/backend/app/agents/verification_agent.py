"""AI Verification Agent — checks if uploaded complaint image plausibly matches issue description."""

import os
import base64
import logging
import urllib.request
from typing import Tuple, Optional
from google import genai
from google.genai import types
from app.agents.gemini_client import clean_json_response, GeminiClientError, DEFAULT_MODEL

logger = logging.getLogger("civicos.agents.verification")


def verify_photo(
    photo_url: Optional[str],
    description: str
) -> Tuple[Optional[bool], Optional[int], Optional[str]]:
    """Evaluates whether photo plausibly shows described complaint issue.
    Returns (verified: bool | None, confidence: int | None, reasoning: str | None).
    """
    if not photo_url or not photo_url.strip():
        return None, None, None

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.info("[verification_agent] GEMINI_API_KEY not set. Skipping verification.")
        return None, None, "Verification skipped (API key unconfigured)"

    try:
        raw_url = photo_url.strip()
        part = None
        if raw_url.startswith("data:image/"):
            header, encoded = raw_url.split(",", 1)
            mime_type = header.split(";")[0].split(":")[1]
            image_bytes = base64.b64decode(encoded)
            part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
        elif raw_url.startswith("http://") or raw_url.startswith("https://"):
            req = urllib.request.Request(raw_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=5) as response:
                image_bytes = response.read()
                content_type = response.headers.get("Content-Type", "image/jpeg")
                part = types.Part.from_bytes(data=image_bytes, mime_type=content_type)

        if not part:
            return None, None, "Invalid image data"

        client = genai.Client(api_key=api_key)
        system_instruction = (
            "You are a civic inspection AI agent. Inspect the image and determine if it plausibly "
            "matches the user's reported civic issue description. "
            "Respond ONLY with strict JSON: {\"verified\": true|false, \"confidence\": <int 0-100>, \"reasoning\": \"one sentence\"}"
        )
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.2,
        )

        user_prompt = f"Issue Description: {description}"
        response = client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=[part, user_prompt],
            config=config,
        )

        if response and response.text:
            content = clean_json_response(response.text)
            verified = bool(content.get("verified", True))
            confidence = int(content.get("confidence", 85))
            confidence = max(0, min(100, confidence))
            reasoning = str(content.get("reasoning", "Image matches complaint description.")).strip()

            print(f"[verification_agent] GEMINI: verified={verified}, confidence={confidence}")
            logger.info(f"[verification_agent] GEMINI: verified={verified}")
            return verified, confidence, reasoning

    except Exception as e:
        logger.warning(f"[verification_agent] Gemini verification failed ({e}). Fallback to unverified.")

    # Graceful fallback: null verification (do not penalize if LLM/network fails)
    return None, None, "Verification skipped due to service error"
