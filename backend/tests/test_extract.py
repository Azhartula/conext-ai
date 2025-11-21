import pytest
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_extract_rejects_non_image():
    response = client.post("/extract/", files={"file": ("test.txt", b"hello", "text/plain")})
    assert response.status_code == 400
    assert response.json()["detail"] == "Only image uploads are supported"


def test_extract_success(monkeypatch):
    async def fake_process(_: bytes):
        return {"contacts": [{"name": "Test User"}], "meta": {"ocr_confidence": 0.9}}

    monkeypatch.setattr("backend.routes.extract.process_contact_image", fake_process)

    response = client.post("/extract/", files={"file": ("card.png", b"fake-bytes", "image/png")})
    assert response.status_code == 200
    body = response.json()
    assert body["contacts"][0]["name"] == "Test User"
    assert body["meta"]["ocr_confidence"] == 0.9
