from backend.core.normalize import normalize_email, normalize_phone


def test_normalize_phone_basic():
    assert normalize_phone("(555) 123-4567") == "+5551234567"


def test_normalize_phone_short_passthrough():
    assert normalize_phone("123") == "123"


def test_normalize_email_lowercase():
    assert normalize_email("User@Example.com") == "user@example.com"


def test_normalize_email_missing_at():
    assert normalize_email("example.com") == "example.com"
