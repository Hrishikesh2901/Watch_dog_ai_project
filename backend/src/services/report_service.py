from database import add_report, get_reports
from utils import anonymize_text, analyze_report
from ai_model import ai_model

def submit_report_logic(category: str, location: str, description: str):
    # 1. Anonymize
    anon_desc = anonymize_text(description)
    
    # 2. Analyze (Predict + Tags)
    predicted_cat = ai_model.predict(anon_desc)
    analysis = analyze_report(anon_desc, category)
    tags = analysis["tags"]
    
    # 3. Save
    add_report(category, location, anon_desc, tags)
    
    return {
        "message": "Report submitted successfully",
        "predicted_category": predicted_cat,
        "tags": tags,
        "anonymized_description": anon_desc
    }

def get_all_reports():
    df = get_reports()
    if df.empty:
        return []
    return df.to_dict(orient="records")
