from setuptools import setup

setup(
    name="green-watcher",
    version="0.1.0",
    py_modules=["main", "auth", "agent", "config"],
    install_requires=[
        "requests",
        "psutil",
    ],
    entry_points={
        "console_scripts": [
            "green-watcher=main:main",
        ],
    },
)
