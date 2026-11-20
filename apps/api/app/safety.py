"""Checks every AI-drafted intro must pass before a student sees it.

Gemini's own safety filters (enabled in icebreakers.py) catch harmful content.
These checks catch what those don't: spam-like or phishing-like output (links,
contact details), profanity, leaked placeholders, and the model talking about
itself, which also limits what a prompt-injected profile could make it say.
"""
import re
from dataclasses import dataclass

MAX_WORDS = 120
MAX_CHARS = 800

_URL = re.compile(r"(https?://|www\.|\b[\w-]+\.(com|net|org|io|ai|co|ly|me|app|dev|xyz)\b)", re.I)
_EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
_PHONE = re.compile(r"(\+?\d[\s().-]?){7,}")
_PLACEHOLDER = re.compile(r"\[[^\]]{1,40}\]|\{[^}]{1,40}\}|<[^>]{1,40}>")
_META = re.compile(r"\b(as an ai|language model|i cannot|i can't help|i'm sorry, but)\b", re.I)
_PROFANITY = re.compile(
    r"\b(fuck\w*|shit\w*|bitch\w*|bastard\w*|asshole\w*|dicks?|crap|crappy|damn\w*|piss(ed|ing)?|slut\w*|whore\w*)\b", re.I)


@dataclass(frozen=True)
class SafetyResult:
    ok: bool
    reason: str | None = None


def check_intro(text: str) -> SafetyResult:
    t = text.strip()
    if not t:
        return SafetyResult(False, "empty")
    if len(t) > MAX_CHARS or len(t.split()) > MAX_WORDS:
        return SafetyResult(False, "too_long")
    for name, pattern in (("email", _EMAIL), ("link", _URL), ("phone", _PHONE),
                          ("placeholder", _PLACEHOLDER), ("meta", _META), ("profanity", _PROFANITY)):
        if pattern.search(t):
            return SafetyResult(False, name)
    return SafetyResult(True)
