from fastapi import FastAPI

app = FastAPI()

@app.get("/")sync def root():
    return {"message": "Welcome to the Farm Assistant addon!"}
