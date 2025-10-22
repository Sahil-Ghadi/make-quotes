from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import quotes

app = FastAPI(title="Quotes API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quotes.router, prefix="/quotes", tags=["Quotes"])

@app.get("/")
async def root():
    return {"message": "Quotes API is running..."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
