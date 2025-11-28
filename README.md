## 🔧 Backend Installation (FastAPI)

### 1️⃣ Create venv (optional)

- cd backend
- python3 -m venv venv
- source venv/bin/activate
## 2️⃣ Install dependencies

pip install -r requirements.txt
## 3️⃣ Run backend
- uvicorn main:app --reload --host 127.0.0.1 --port 8000
- Backend will run at:
- ➡ http://127.0.0.1:8000
## Frontend Setup
- Option A — Use VS Code Live Server
- Right-click index.html → Open with Live Server

- Frontend URL:
- ➡ http://127.0.0.1:5500

## Option B — Use Python simple server
- cd frontend
- python3 -m http.server 3000
- Frontend URL:
- ➡ http://127.0.0.1:3000

