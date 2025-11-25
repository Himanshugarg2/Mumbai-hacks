# services/fd_bond_service.py

from typing import List, Optional


# ✅ Static Fixed Deposit dataset
FIXED_DEPOSITS = [
    {
        "bank": "SBI",
        "type": "Regular FD",
        "tenure": "7 days - 10 years",
        "interest_rate": "3.50% - 7.10%",
        "senior_citizen_rate": "4.00% - 7.60%",
        "min_amount": 1000,
        "risk": "low",
    },
    {
        "bank": "HDFC Bank",
        "type": "Regular FD",
        "tenure": "7 days - 10 years",
        "interest_rate": "3.00% - 7.25%",
        "senior_citizen_rate": "3.50% - 7.75%",
        "min_amount": 5000,
        "risk": "low",
    },
    {
        "bank": "ICICI Bank",
        "type": "Regular FD",
        "tenure": "7 days - 10 years",
        "interest_rate": "3.00% - 7.20%",
        "senior_citizen_rate": "3.50% - 7.70%",
        "min_amount": 10000,
        "risk": "low",
    },
    {
        "bank": "Axis Bank",
        "type": "Tax Saver FD (5 years)",
        "tenure": "5 years",
        "interest_rate": "7.10%",
        "senior_citizen_rate": "7.60%",
        "min_amount": 100,
        "risk": "low",
    },
]


# ✅ Static Government Bond dataset
GOVERNMENT_BONDS = [
    {
        "bond_name": "7.18% GS 2033",
        "type": "G-Sec",
        "maturity": "2033",
        "coupon": "7.18%",
        "risk": "low",
        "min_investment": 10000,
    },
    {
        "bond_name": "Floating Rate Savings Bond (FRSB) 2020",
        "type": "RBI Retail",
        "maturity": "7 years",
        "coupon": "8.05% (floating)",
        "risk": "low",
        "min_investment": 1000,
    },
    {
        "bond_name": "Sovereign Gold Bond (SGB)",
        "type": "Gold-backed",
        "maturity": "8 years",
        "coupon": "2.50% + gold price return",
        "risk": "medium",
        "min_investment": 1,  # 1 gram
    },
    {
        "bond_name": "T-Bill 91 Days",
        "type": "Treasury Bill",
        "maturity": "91 days",
        "coupon": "Zero-coupon (discount basis)",
        "risk": "low",
        "min_investment": 25000,
    },
]


SMALL_SAVINGS = [
    {
        "scheme": "Public Provident Fund (PPF)",
        "interest_rate": "7.1%",
        "lock_in": "15 years",
        "tax_benefit": "EEE (No tax on interest & maturity)",
        "risk": "low",
        "min_investment": 500,
    },
    {
        "scheme": "Senior Citizen Savings Scheme (SCSS)",
        "interest_rate": "8.2%",
        "lock_in": "5 years",
        "tax_benefit": "80C eligible",
        "risk": "low",
        "min_investment": 1000,
    },
    {
        "scheme": "Sukanya Samriddhi Yojana (SSY)",
        "interest_rate": "8.2%",
        "lock_in": "21 years",
        "risk": "low",
        "min_investment": 250,
    },
    {
        "scheme": "National Savings Certificate (NSC)",
        "interest_rate": "7.7%",
        "lock_in": "5 years",
        "risk": "low",
        "min_investment": 1000,
    },
    {
        "scheme": "Kisan Vikas Patra (KVP)",
        "interest_rate": "7.5%",
        "maturity": "115 months",
        "risk": "low",
        "min_investment": 1000,
    },
]


# ✅ Return all FDs
def get_all_fds():
    return {"count": len(FIXED_DEPOSITS), "fds": FIXED_DEPOSITS}


# ✅ Return all bonds
def get_all_bonds():
    return {"count": len(GOVERNMENT_BONDS), "bonds": GOVERNMENT_BONDS}


# filtering fds
def filter_fds(bank=None, min_amount=None):
    data = FIXED_DEPOSITS
    if bank:
        data = [fd for fd in data if bank.lower() in fd["bank"].lower()]
    if min_amount:
        data = [fd for fd in data if fd["min_amount"] <= min_amount]
    return data


def filter_bonds(risk: Optional[str] = None):
    data = GOVERNMENT_BONDS
    if risk:
        data = [b for b in data if b["risk"].lower() == risk.lower()]
    return data


def get_all_small_savings():
    return {"count": len(SMALL_SAVINGS), "schemes": SMALL_SAVINGS}
