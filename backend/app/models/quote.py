from pydantic import BaseModel

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
