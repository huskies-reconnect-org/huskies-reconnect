import pytest

from app.safety import check_intro

GOOD = ("Hi Maya! I saw we're both in CS5100 and both into evaluating language models. "
        "I'd love to compare notes on the NLP side of the course. Want to grab coffee at Snell "
        "after Thursday's lecture or set up a study session before the midterm?")


def test_good_intro_passes():
    assert check_intro(GOOD).ok


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
