# Project Setup

## Backend Setup
- Location: `backend/`
- Steps:
  1. Open terminal and navigate to `backend/`
  2. Create and activate virtual environment:
	  - Windows:
		 ```powershell
		 python -m venv venv
		 .\venv\Scripts\activate
		 ```
	  - Mac/Linux:
		 ```bash
		 python3 -m venv venv
		 source venv/bin/activate
		 ```
  3. Install dependencies:
	  ```bash
	  pip install -r requirements.txt
	  ```
  4. Start backend server:
	  ```bash
	  uvicorn main:app --port 8000
	  ```
  5. (Optional) Initialize git and push:
	  ```bash
	  git init
	  git add .
	  git commit -m "Initial commit"
	  git remote add origin <your-repo-url>
	  git push -u origin main
	  ```

## Frontend Setup
- Location: `frontend/`
- Steps:
  1. Open terminal and navigate to `frontend/`
  2. Install dependencies:
	  ```bash
	  npm install
	  ```
  3. Start frontend dev server:
	  ```bash
	  npm run dev
	  ```
  4. (Optional) Initialize git and push:
	  ```bash
	  git init
	  git add .
	  git commit -m "Initial commit"
	  git remote add origin <your-repo-url>
	  git push -u origin main
	  ```

