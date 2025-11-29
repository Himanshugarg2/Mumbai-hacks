# Kuber — AI Financial Assistant

A smart financial companion built using **React**, **FastAPI**, and **Generative AI** to help gig-workers manage unpredictable income, track daily earnings, and receive personalized financial guidance.

---

## 🚀 Features

* Cashflow forecasting
* Daily earnings & expense ledger
* Safe-spending limit alerts
* Opportunity suggestions for higher earnings
* Personalized investment recommendations

---

## 🛠️ Tech Stack

* **Frontend:** React
* **Backend:** FastAPI
* **AI:** LLM-based agents

---

## 📦 Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Set required environment variables:

```
DATABASE_URL=...
GEMINI_API_KEY=...
```

---

## 📡 API

* `POST /ledger` — add earning/expense
* `GET /forecast/{userId}` — income & expense prediction
* `GET /recommendations/{userId}` — personalized guidance

---

## 📁 Project Structure

* **react-app/** — UI dashboard
* **fastapi-backend/** — routes, agents, forecasting logic
* **models/** — AI prompts & model configs

---

## 👥 Team

Varun Soni
Asmi Rode
Pratham Shenoy
Himanshu Garg
<img width="1191" height="880" alt="image" src="https://github.com/user-attachments/assets/7fec8fa4-5c59-4d18-b61a-d802e58b9de2" />
<img width="1631" height="812" alt="image" src="https://github.com/user-attachments/assets/daf3424c-a63d-42a5-ab59-4c1bc09afe87" />