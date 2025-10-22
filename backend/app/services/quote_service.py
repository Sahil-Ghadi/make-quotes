from app.config import db
from datetime import datetime
import uuid

def create_quote(user, quote_data):
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

def get_my_quotes(user):
    docs = db.collection("quotes").where("user_id", "==", user["uid"]).stream()
    return [doc.to_dict() for doc in docs]

def get_all_quotes():
    docs = db.collection("quotes").stream()
    return [doc.to_dict() for doc in docs]

def update_quote(user, quote_id, quote_data):
    doc_ref = db.collection("quotes").document(quote_id)
    doc = doc_ref.get()
    if not doc.exists:
        return None, "not_found"

    quote = doc.to_dict()
    if quote["user_id"] != user["uid"]:
        return None, "forbidden"

    updated_quote = {
        **quote,
        "text": quote_data.text,
        "author": quote_data.author,
        "updated_at": datetime.now().isoformat(),
    }
    doc_ref.update(updated_quote)
    return updated_quote, None

def delete_quote(user, quote_id):
    doc_ref = db.collection("quotes").document(quote_id)
    doc = doc_ref.get()
    if not doc.exists:
        return "not_found"

    quote = doc.to_dict()
    if quote["user_id"] != user["uid"]:
        return "forbidden"

    doc_ref.delete()
    return None
