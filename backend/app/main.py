import random
import asyncio
from uuid import uuid4

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

tasks = {}


@app.post("/start-tasks")
async def start_tasks():
    global tasks
    tasks = {}

    for _ in range(50):
        task_id = str(uuid4())
        tasks[task_id] = "pending"
        asyncio.create_task(run_task(task_id))

    return {"message": "Tasks started", "task_ids": list(tasks.keys())}


async def run_task(task_id):
    """
    Simulate a long-running task.
    """
    sleep_time = random.randint(30, 120)
    await asyncio.sleep(sleep_time)
    tasks[task_id] = (
        "completed" if random.random() > 0.2 else "failed"
    )  # 80% success rate


@app.get("/status")
def get_status():
    """
    Return the status of all tasks
    """
    return {"tasks": tasks}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
