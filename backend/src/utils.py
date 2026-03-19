import re

def anonymize_text(text: str) -> str:
    """
    Anonymizes sensitive information from the text.
    Removes:
    - Email addresses
    - Phone numbers (simple 10 digit patterns)
    - Aadhaar-like numbers (12 digits)
    """
    if not text:
        return ""
    
    # Email regex
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    text = re.sub(email_pattern, '[EMAIL REDACTED]', text)
    
    # Phone number regex (Simple 10 digits, maybe with separators)
    phone_pattern = r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b'
    text = re.sub(phone_pattern, '[PHONE REDACTED]', text)

    # Aadhaar-like regex (12 digits)
    aadhaar_pattern = r'\b\d{4}\s?\d{4}\s?\d{4}\b'
    text = re.sub(aadhaar_pattern, '[ID REDACTED]', text)
    
    return text

def analyze_report(description: str, category: str) -> dict:
    """
    Analyzes the report description and category to extract tags and sentiment (mock).
    Returns a dict with tags.
    """
    tags = []
    desc_lower = description.lower()
    
    # Simple keyword extraction
    keywords = {
        "biometric": ["fingerprint", "iris", "scan", "biometric", "match"],
        "delay": ["wait", "late", "pending", "slow", "delay", "months"],
        "rejection": ["reject", "denied", "fail", "declined"],
        "network": ["server", "down", "internet", "connectivity", "offline"],
        "corruption": ["bribe", "money", "pay", "demand"],
        "lack of information": ["reason", "why", "explain", "explanation", "don't know", "unknown"]
    }

    for tag, words in keywords.items():
        if any(word in desc_lower for word in words):
            tags.append(tag)
            
    # Add category as a tag if not present
    if category.lower() not in tags:
        tags.append(category.lower())

    return {
        "tags": list(set(tags)),
        "auto_category": category # Placeholder for more advanced categorization
    }
