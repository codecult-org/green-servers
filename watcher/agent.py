import time
import socket
import psutil
import requests
from config import get_token, get_endpoint, load_config
from auth import validate

def collect_metrics():
    return {
        "hostname": socket.gethostname(),
        "cpu": psutil.cpu_percent(interval=1),
        "memory": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage("/").percent,
        "uptime": int(time.time() - psutil.boot_time()),
        "timestamp": int(time.time() * 1000)
    }

@validate
def push_metrics():
    token = get_token()
    endpoint = get_endpoint()
    
    if not token:
        print("Error: No authentication token found. Please run 'login' first.")
        return False

    payload = collect_metrics()
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    # Assuming metrics endpoint
    url = f"{endpoint}/api/metrics"

    try:
        r = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=5
        )
        
        if r.status_code == 401:
            print("Error: Token expired or invalid. Please login again.")
            return False
            
        r.raise_for_status()
        print(f"Metrics pushed to {url}")
        return True
    except Exception as e:
        print("Push failed:", e)
        # Return True to continue loop even if network fails, 
        # but False if auth fails (handled above)
        return True 

@validate
def start_agent():
    print("Green Servers Python Agent started")
    
    # Check auth once before starting loop
    if not get_token():
        print("Error: Not logged in. Please run the login command.")
        return

    while True:
        success = push_metrics()
        if not success:
            # If auth failed, we stop the agent to avoid spamming logs/server
            print("Agent stopping due to authentication failure.")
            break
        interval = load_config().get("interval", 10)
        time.sleep(interval)
