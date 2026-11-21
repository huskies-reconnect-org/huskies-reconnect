import pytest

from app.safety import check_intro

GOOD = ("Hi Maya! I saw we're both in CS5100 and both into evaluating language models. "
        "I'd love to compare notes on the NLP side of the course. Want to grab coffee at Snell "
        "after Thursday's lecture or set up a study session before the midterm?")


def test_good_intro_passes():
    assert check_intro(GOOD).ok


@pytest.mark.parametrize("text", [
    "Hi Aisha! I loved your take on language model safety in CS5100. Coffee sometime?",
    "Hey Maya, we both work on evaluating a large language model for class. Want to compare notes?",
    "Hi Ethan! I cannot wait to see your AR project. Coffee after Thursday's lecture?",
])
def test_talking_about_language_models_passes(text):
    assert check_intro(text).ok


@pytest.mark.parametrize("text", [
    "As an AI language model, I suggest you meet up.",
    "As a language model I can't know your schedule, but want to study?",
    "I am an AI, but here's a message: want to study?",
    "I'm a large language model. Hi Bob!",
    "I cannot help with writing messages to other students.",
    "I'm sorry, but I can't write that.",
])
def test_model_talking_about_itself_is_rejected(text):
    r = check_intro(text)
    assert not r.ok and r.reason == "meta"


def test_names_that_contain_blocked_substrings_pass():
    assert check_intro("Hi Dickinson! Want to study for CS5100 together this week? I love Pissarro too.").ok


@pytest.mark.parametrize("text, reason", [
    ("", "empty"),
    ("word " * 121, "too_long"),
    (GOOD + " Check out https://example.com", "link"),
    (GOOD + " my site is maya.dev", "link"),
    (GOOD + " Email me at maya@gmail.com", "email"),
    (GOOD + " Call 617-555-0123", "phone"),
    ("Hi [Name], want to study together for CS5100?", "placeholder"),
    ("As an AI language model, I suggest you meet up.", "meta"),
    ("This class is shit, want to study?", "profanity"),
])
def test_rejections(text, reason):
    r = check_intro(text)
    assert not r.ok and r.reason == reason
