from fastapi import FastAPI

from routers.predictions import router as predictions_router

app = FastAPI()


app.include_router(predictions_router)


@app.get("/")
def read_root():
    return {"status": "ok"}
