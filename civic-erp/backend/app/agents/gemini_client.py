"""Shared Gemini API client helper using the official google-genai SDK."""

import os
import json
import logging
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

logger = logging.getLogger("civicos.agents.gemini")

# Fast, cost-effective flash-tier model suitable for short structured completions
DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


class GeminiClientError(Exception):
    """Raised when Gemini API key is missing, invalid, or generation fails."""
    pass


def clean_json_response(raw_resp: str) -> dict:
    """Extracts and parses JSON object from LLM response text, stripping markdown code fences if present."""
    if not raw_resp:
        raise ValueError("Empty response from Gemini")

    text = raw_resp.strip()
    # Strip markdown fenced code blocks (```json ... ```)
    if text.startswith("```"):
        lines = text.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()

    # Find boundaries of JSON object
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start : end + 1]

    return json.loads(text)


def generate(prompt: str, system: str | None = None) -> str:
    """
    Generates text using the official google-genai SDK.
    Raises GeminiClientError if key is missing or API call fails.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise GeminiClientError("GEMINI_API_KEY environment variable is not set")

    try:
        client = genai.Client(api_key=api_key)
        config = None
        if system:
            config = types.GenerateContentConfig(
                system_instruction=system,
                temperature=0.2,
            )

        models_to_try = [DEFAULT_MODEL, "gemini-2.0-flash", "gemini-1.5-flash"]
        # Retain order, remove duplicates
        models_to_try = list(dict.fromkeys(models_to_try))

        last_error = None
        for model in models_to_try:
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=config,
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                last_error = e
                continue

        raise GeminiClientError(f"Gemini API call failed across models: {last_error}")
    except Exception as e:
        if isinstance(e, GeminiClientError):
            raise
        raise GeminiClientError(f"Gemini generation error: {e}")
