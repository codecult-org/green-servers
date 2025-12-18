#!/usr/bin/env python3
import argparse
from auth import login, logout
from agent import start_agent
from config import ensure_config

def main():
    ensure_config()
    parser = argparse.ArgumentParser(description="Green Servers Watcher CLI")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Login command
    subparsers.add_parser("login", help="Login to Green Servers")

    # Start command
    subparsers.add_parser("start", help="Start the metrics agent")

    args = parser.parse_args()

    if args.command == "login":
        login()
    elif args.command == "logout":
        logout()
    elif args.command == "start":
        start_agent()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
