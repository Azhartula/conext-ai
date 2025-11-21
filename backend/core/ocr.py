from __future__ import annotations

import asyncio
from dataclasses import dataclass
from io import BytesIO
from typing import Protocol, TypedDict

from PIL import Image, UnidentifiedImageError

from backend.core.config import get_settings

try:  # pragma: no cover - optional dependency guard
    import pytesseract
    from pytesseract import Output
except ImportError:  # pragma: no cover
    pytesseract = None  # type: ignore[assignment]
    Output = None  # type: ignore[assignment]


class OcrResult(TypedDict):
    text: str
    confidence: float


class OcrProvider(Protocol):
    async def extract_text(self, image_bytes: bytes) -> OcrResult:
        """Return extracted text and a confidence score between 0 and 1."""


@dataclass
class TesseractProvider:
    lang: str = "eng"
    tesseract_cmd: str | None = None

    def __post_init__(self):
        if pytesseract is not None and self.tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = self.tesseract_cmd

    async def extract_text(self, image_bytes: bytes) -> OcrResult:
        if pytesseract is None:
            raise RuntimeError("pytesseract is not installed. Install it or configure another OCR provider.")

        try:
            return await asyncio.to_thread(self._extract_sync, image_bytes)
        except pytesseract.TesseractNotFoundError as exc:  # type: ignore[attr-defined]
            raise RuntimeError(
                "Tesseract OCR binary not found. Install Tesseract or set TESSERACT_CMD in the environment."
            ) from exc
        except UnidentifiedImageError as exc:
            raise ValueError("Unable to read image data. Ensure a valid image file is uploaded.") from exc

    def _extract_sync(self, image_bytes: bytes) -> OcrResult:
        image = Image.open(BytesIO(image_bytes))
        image = image.convert("RGB")
        text = pytesseract.image_to_string(image, lang=self.lang)
        confidence = 0.0

        if Output is not None:
            data = pytesseract.image_to_data(image, lang=self.lang, output_type=Output.DICT)
            confidences = [float(conf) for conf in data.get("conf", []) if conf not in {"-1", "-0"}]
            if confidences:
                # pytesseract reports confidence as percentage (0-100)
                confidence = max(min(sum(confidences) / len(confidences) / 100.0, 1.0), 0.0)

        return {"text": text.strip(), "confidence": round(confidence, 4)}


async def run_ocr(image_bytes: bytes) -> OcrResult:
    settings = get_settings()

    if settings.ocr_provider == "tesseract":
        provider: OcrProvider = TesseractProvider(
            lang=settings.tesseract_lang,
            tesseract_cmd=settings.tesseract_cmd,
        )
    else:
        raise ValueError(f"Unsupported OCR provider: {settings.ocr_provider}")

    return await provider.extract_text(image_bytes)
