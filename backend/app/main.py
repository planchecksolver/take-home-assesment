from fastapi import FastAPI, Request, Response
import random
import asyncio

app = FastAPI()

@app.get("/process")
async def process(request: Request):
    sleep_time = random.randint(30, 120)
    await asyncio.sleep(sleep_time)
    
    return Response("ok", status_code=200)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
