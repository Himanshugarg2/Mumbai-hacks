from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

# Firestore CRUD
from services.firestore_service import (
    add_dream,
    get_dreams,
    update_dream,
    delete_dream,
    get_summary,
)

from services.gemini_service import generate_advice

# Mutual funds
from services.mutual_funds import get_filtered_funds, fetch_amfi_data

# FD, Bonds, Savings
from services.fd_bond_service import (
    get_all_fds,
    get_all_bonds,
    get_all_small_savings,
)

# Loans
from services.loan_service import get_all_loans, filter_loans

# Agents
from agents.cashflow_agent import CashflowPredictionService
from agents.opportunity_agent import OpportunityScoutService
from agents.smart_spend_agent import SmartSpendGuardianService  # NEW

from services.gemini_service import generate_advice

# ----------------------------------------------------------------------------
# FastAPI App
# ----------------------------------------------------------------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------------------------------
# Health
# ----------------------------------------------------------------------------


@app.get("/")
def health():
    return {"status": "ok"}


# ----------------------------------------------------------------------------
# Dreams CRUD
# ----------------------------------------------------------------------------


@app.post("/dreams")
def create_dream(payload: dict):
    add_dream(payload["userId"], payload)
    return {"message": "dream added"}


@app.get("/dreams/{userId}")
def list_dreams(userId: str):
    return get_dreams(userId)


@app.put("/dreams/{userId}/{dreamId}")
def modify_dream(userId: str, dreamId: str, payload: dict):
    update_dream(userId, dreamId, payload)
    return {"message": "dream updated"}


@app.delete("/dreams/{userId}/{dreamId}")
def remove_dream(userId: str, dreamId: str):
    delete_dream(userId, dreamId)
    return {"message": "dream deleted"}


# ----------------------------------------------------------------------------
# Summary (expenses + income aggregated)
# ----------------------------------------------------------------------------


@app.get("/summary/{userId}")
def summary_route(userId: str):
    return get_summary(userId)


# ----------------------------------------------------------------------------
# Mutual Funds
# ----------------------------------------------------------------------------


@app.get("/mutual-funds")
def mutual_funds(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    risk: str | None = None,
    category: str | None = None,
    search: str | None = None,
):
    return get_filtered_funds(
        page=page,
        limit=limit,
        risk=risk,
        category=category,
        search=search,
    )


@app.get("/mutual-funds/all")
def get_all_funds():
    return {"results": fetch_amfi_data()}


# ----------------------------------------------------------------------------
# FD, Bonds, Savings
# ----------------------------------------------------------------------------


@app.get("/fds")
def fds():
    return get_all_fds()


@app.get("/bonds")
def bonds():
    return get_all_bonds()


@app.get("/savings")
def savings():
    return get_all_small_savings()


# ----------------------------------------------------------------------------
# Loans
# ----------------------------------------------------------------------------


@app.get("/loans")
def loans(type: str | None = None, risk: str | None = None):
    if type or risk:
        return filter_loans(type=type, risk=risk)
    return get_all_loans()


# ----------------------------------------------------------------------------
# Gemini Advice Generator
# ----------------------------------------------------------------------------


@app.post("/generate-advice")
def advice_route(payload: dict):
    summary = get_summary(payload["userId"])
    advice = generate_advice(summary)
    return {"advice": advice}


# ----------------------------------------------------------------------------
# Cashflow Predictor (UPDATED)
# ----------------------------------------------------------------------------


@app.get("/cashflow/predict/{userId}")
def cashflow_predict(userId: str):
    service = CashflowPredictionService(userId)
    return service.predict()


# ----------------------------------------------------------------------------
# Opportunity Scout (TomTom + lat/lon)
# ----------------------------------------------------------------------------


@app.get("/ai/opportunity/{userId}")
def opportunity_scout(
    userId: str,
    lat: float | None = None,
    lon: float | None = None,
):
    service = OpportunityScoutService(userId)
    return service.predict(lat=lat, lon=lon)


# ----------------------------------------------------------------------------
# SmartSpend Guardian Agent (NEW – Agent B)
# ----------------------------------------------------------------------------


@app.get("/ai/smart-guardian/{userId}")
def smart_guardian(userId: str):
    service = SmartSpendGuardianService(userId)
    return service.predict()
