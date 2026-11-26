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
# Only the model talking about itself. Topics like "language model safety" are common in
# student profiles and must pass.
_META = re.compile(
    r"\b(as an ai\b|as a(n ai)? (large )?language model|i('m| am) (just )?(an ai|a (large )?language model)"
    r"|i (cannot|can't|am unable to|'m unable to) (help|assist|provide|create|write|generate|fulfill)"
    r"|i'm sorry, but)", re.I)
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


# Reconnect drafts (after the semester ends) must read as catching up, never as if the
# course were still running. The model doesn't always follow the instruction, so this
# is enforced here and a failing draft is redrafted.
_RECONNECT_CUE = re.compile(
    r"last (semester|term|fall|spring)|were in .{0,40}together|took .{0,40}together|back in"
    r"|since (the )?(course|class|semester|term) (ended|wrapped|finished)|since we finished"
    r"|catch up|catching up|reconnect|been a (while|minute)", re.I)
_ONGOING_COURSE = re.compile(
    r"we('re| are) both (in|taking|enrolled in) (this |the )?(course|class|[a-z]{2,5} ?\d{4})|share notes|compare notes on (the )?(lectures?|homework|assignments)"
    r"|study (group|session|together|partner)|before the (midterm|final|exam)|after (class|lecture)"
    r"|this week'?s (lecture|class|homework)", re.I)


def check_reconnect_tone(text: str) -> SafetyResult:
    if _ONGOING_COURSE.search(text):
        return SafetyResult(False, "ongoing_course")
    if not _RECONNECT_CUE.search(text):
        return SafetyResult(False, "no_reconnect_framing")
    return SafetyResult(True)
