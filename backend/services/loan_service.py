# services/loan_service.py

from typing import Optional

LOANS = [
    {
        "type": "Personal Loan",
        "bank": "HDFC Bank",
        "interest_rate": "10.5% - 21%",
        "max_tenure": "6 years",
        "processing_fee": "Up to 2.5%",
        "eligibility": "Salary ≥ ₹25,000/month",
        "risk": "high",
        "use_case": "Emergency, medical, travel, debt consolidation",
    },
    {
        "type": "Home Loan",
        "bank": "SBI",
        "interest_rate": "8.4% - 9.5%",
        "max_tenure": "30 years",
        "processing_fee": "0% (limited offers)",
        "eligibility": "CIBIL ≥ 650",
        "risk": "medium",
        "use_case": "Buying or constructing house",
    },
    {
        "type": "Car Loan",
        "bank": "ICICI Bank",
        "interest_rate": "8.75% - 12.5%",
        "max_tenure": "7 years",
        "processing_fee": "₹3,000 - ₹5,000",
        "risk": "medium",
        "use_case": "New or used car purchase",
    },
    {
        "type": "Gold Loan",
        "bank": "Axis Bank",
        "interest_rate": "7.9% - 17%",
        "max_tenure": "3 years",
        "processing_fee": "1% of loan amount",
        "risk": "low",
        "use_case": "Short-term loan against gold",
    },
    {
        "type": "Education Loan",
        "bank": "Bank of Baroda",
        "interest_rate": "8.4% - 11.5%",
        "max_tenure": "15 years",
        "processing_fee": "Zero for govt-listed institutes",
        "risk": "medium",
        "use_case": "Higher education in India/abroad",
    },
]


def get_all_loans():
    return {"count": len(LOANS), "loans": LOANS}


def filter_loans(type: Optional[str] = None, risk: Optional[str] = None):
    data = LOANS
    if type:
        data = [l for l in data if type.lower() in l["type"].lower()]
    if risk:
        data = [l for l in data if l["risk"].lower() == risk.lower()]
    return {"count": len(data), "loans": data}
