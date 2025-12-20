import json
from pathlib import Path

CONFIG_DIR = Path.home() / ".green-servers"
CONFIG_FILE = CONFIG_DIR / "config.json"
PUSH_API_ENDPOINT = "http://localhost:3000"  # Default endpoint

DEFAULT_CONFIG = {
    "endpoint": PUSH_API_ENDPOINT,
    "interval": 10 # how many seconds between metric pushes
}

def ensure_config():
    """Ensure the config file exists with default values."""
    if not CONFIG_FILE.exists():
        save_config(DEFAULT_CONFIG)

def load_config():
    """Load configuration from the local config file."""
    if not CONFIG_FILE.exists():
        return DEFAULT_CONFIG.copy()
    try:
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return DEFAULT_CONFIG.copy()

def save_config(config):
    """Save configuration to the local config file."""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=2)

def get_token():
    """Retrieve the JWT token from config."""
    config = load_config()
    return config.get("token")

def get_endpoint():
    """Retrieve the API endpoint from config."""
    config = load_config()
    return config.get("endpoint", "http://localhost:3000") # Default fallback
