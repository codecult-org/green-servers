import getpass
import requests
from config import save_config, load_config, get_endpoint

def login():
    print("Login to Green Servers")
    
    endpoint = get_endpoint()
    
    username = input("Username/Email: ")
    password = getpass.getpass("Password: ")

    # Assuming standard JWT auth endpoint
    login_url = f"{endpoint}/api/auth/login"
    
    print(f"Authenticating with {login_url}...")

    try:
        response = requests.post(
            login_url, 
            json={"username": username, "password": password}, 
            timeout=10
        )
        response.raise_for_status()
        
        data = response.json()
        # Support standard JWT response formats
        token = data.get("token") or data.get("access_token")
        
        if not token:
            print("Error: Server response did not contain a token.")
            return

        config = load_config()
        config["token"] = token
        config["endpoint"] = endpoint
        save_config(config)
        print("Login successful! Credentials saved.")
        
    except requests.exceptions.ConnectionError:
        print(f"Error: Could not connect to {endpoint}. Please check your internet connection or the server URL.")
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 401:
            print("Login failed: Invalid credentials.")
        else:
            print(f"Login failed: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

def logout():
    config = load_config()
    if "token" in config:
        del config["token"]
        save_config(config)
        print("Logged out successfully.")
    else:
        print("No active session found.")

def validate(func):
    """Decorator to validate login before executing the function."""
    def wrapper(*args, **kwargs):
        token = load_config().get("token")
        if not token:
            print("Error: No authentication token found. Please run 'login' first.")
            return
        return func(*args, **kwargs)
    return wrapper