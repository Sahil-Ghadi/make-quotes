from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List
import firebase_admin
from firebase_admin import credentials, auth, firestore
from datetime import datetime
import uuid

# Initialize Firebase
try:
    firebase_admin.get_app()
except ValueError:
    cred = credentials.Certificate("firebase-service-account.json")
    firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

app = FastAPI(title="Quotes API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Models
class QuoteBase(BaseModel):
    text: str
    author: str

class QuoteCreate(QuoteBase):
    pass

class Quote(QuoteBase):
    id: str
    user_id: str
    user_email: str
    created_at: str
    updated_at: str


# Firebase Auth Dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )


# Routes
@app.get("/")
async def root():
    return {"message": "Quotes API is running..."}


@app.post("/quotes", response_model=Quote)
async def create_quote(quote_data: QuoteCreate, user=Depends(get_current_user)):
    quote_id = str(uuid.uuid4())
    current_time = datetime.now().isoformat()

    new_quote = {
        "id": quote_id,
        "text": quote_data.text,
        "author": quote_data.author,
        "user_id": user["uid"],
        "user_email": user["email"],
        "created_at": current_time,
        "updated_at": current_time,
    }

    db.collection("quotes").document(quote_id).set(new_quote)
    return new_quote


@app.get("/quotes/my", response_model=List[Quote])
async def get_my_quotes(user=Depends(get_current_user)):
    docs = db.collection("quotes").where("user_id", "==", user["uid"]).stream()
    quotes = [doc.to_dict() for doc in docs]
    return quotes


@app.get("/quotes/all", response_model=List[Quote])
async def get_all_quotes():
    docs = db.collection("quotes").stream()
    quotes = [doc.to_dict() for doc in docs]
    return quotes


@app.put("/quotes/{quote_id}", response_model=Quote)
async def update_quote(quote_id: str, quote_data: QuoteCreate, user=Depends(get_current_user)):
    doc_ref = db.collection("quotes").document(quote_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Quote not found")

    quote = doc.to_dict()
    if quote["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this quote")

    updated_quote = {
        **quote,
        "text": quote_data.text,
        "author": quote_data.author,
        "updated_at": datetime.now().isoformat(),
    }

    doc_ref.update(updated_quote)
    return updated_quote


@app.delete("/quotes/{quote_id}")
async def delete_quote(quote_id: str, user=Depends(get_current_user)):
    doc_ref = db.collection("quotes").document(quote_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Quote not found")

    quote = doc.to_dict()
    if quote["user_id"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this quote")

    doc_ref.delete()
    return {"message": "Quote deleted successfully ✅"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
