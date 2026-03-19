import pytest
from src.utils import anonymize_text, analyze_report

def test_anonymize_text():
    text = "Contact me at john.doe@example.com or 9876543210."
    anonymized = anonymize_text(text)
    assert "[EMAIL REDACTED]" in anonymized
    assert "[PHONE REDACTED]" in anonymized
    assert "john.doe@example.com" not in anonymized
    assert "9876543210" not in anonymized

def test_anonymize_aadhaar_like():
    text = "My ID is 1234 5678 9012."
    anonymized = anonymize_text(text)
    assert "[ID REDACTED]" in anonymized
    assert "1234 5678 9012" not in anonymized

def test_analyze_report_tags():
    desc = "The fingerprint scan failed and I was denied entry."
    analysis = analyze_report(desc, "Ration")
    tags = analysis["tags"]
    assert "biometric" in tags
    assert "rejection" in tags
    assert "ration" in tags

def test_analyze_report_no_keywords():
    desc = "I went to the office."
    analysis = analyze_report(desc, "Other")
    tags = analysis["tags"]
    assert "other" in tags
