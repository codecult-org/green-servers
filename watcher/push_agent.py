import os
import time
import socket
import psutil
import requests

MOTIA_ENDPOINT = os.getenv("MOTIA_ENDPOINT")
API_KEY = os.getenv("METRICS_KEY")
INTERVAL = int(os.getenv("PUSH_INTERVAL", "60"))

def collect_metrics():
    return {
        "hostname": socket.gethostname(),
        "cpu": psutil.cpu_percent(interval=1),
        "memory": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage("/").percent,
        "uptime": int(time.time() - psutil.boot_time()),
    }

def push_metrics():
    payload = collect_metrics()
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    try:
        r = requests.post(
            MOTIA_ENDPOINT,
            json=payload,
            headers=headers,
            timeout=5
        )
        r.raise_for_status()
        print("Metrics pushed")
    except Exception as e:
        print("Push failed:", e)

if __name__ == "__main__":
    print("Green Servers Python Agent started")
    while True:
        push_metrics()
        time.sleep(INTERVAL)
