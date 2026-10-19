from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routers import modules, execute, i18n

app = FastAPI(
    title="Data Engineering Learning Platform API",
    description="High-performance backend API serving lessons, sandboxes, and flashcards for DE students.",
    version="1.0.0"
)

# Configure CORS to allow access from modern frontends (e.g. Next.js on port 3000, Vite on 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(modules.router)
app.include_router(execute.router)
app.include_router(i18n.router)

@app.get("/")
@app.get("/healthz")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "de-learning-platform-backend",
        "modules_count": 8,
        "engine": "FastAPI + Python 3.12"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.main:app", host="127.0.0.1", port=8000, reload=True)
