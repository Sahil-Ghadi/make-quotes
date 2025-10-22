from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.quote import Quote, QuoteCreate
from app.dependencies.auth import get_current_user
from app.services.quote_service import create_quote, get_my_quotes, get_all_quotes, update_quote, delete_quote

router = APIRouter()

@router.post("/", response_model=Quote)
async def create_quote_route(quote_data: QuoteCreate, user=Depends(get_current_user)):
    return create_quote(user, quote_data)

@router.get("/my", response_model=List[Quote])
async def get_my_quotes_route(user=Depends(get_current_user)):
    return get_my_quotes(user)

@router.get("/all", response_model=List[Quote])
async def get_all_quotes_route():
    return get_all_quotes()

@router.put("/{quote_id}", response_model=Quote)
async def update_quote_route(quote_id: str, quote_data: QuoteCreate, user=Depends(get_current_user)):
    updated_quote, error = update_quote(user, quote_id, quote_data)
    if error == "not_found":
        raise HTTPException(status_code=404, detail="Quote not found")
    if error == "forbidden":
        raise HTTPException(status_code=403, detail="Not authorized")
    return updated_quote

@router.delete("/{quote_id}")
async def delete_quote_route(quote_id: str, user=Depends(get_current_user)):
    error = delete_quote(user, quote_id)
    if error == "not_found":
        raise HTTPException(status_code=404, detail="Quote not found")
    if error == "forbidden":
        raise HTTPException(status_code=403, detail="Not authorized")
    return {"message": "Quote deleted successfully ✅"}
