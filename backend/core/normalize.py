import re

_PHONE_PATTERN = re.compile(r"[+\d][\d\s().-]{6,}")


def normalize_phone(raw: str | None) -> str | None:
    if not raw:
        return None
    digits = re.sub(r"\D", "", raw)
    if len(digits) < 7:
        return raw
    if digits.startswith("0"):
        digits = digits[1:]
    return "+" + digits


def normalize_email(raw: str | None) -> str | None:
    if not raw:
        return None
    value = raw.strip().lower()
    if "@" not in value:
        return raw
    return value
