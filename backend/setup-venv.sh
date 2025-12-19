#!/bin/bash

echo "Setting up Python virtual environment for AgriSaarthi Chat Backend..."

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

echo "Virtual environment setup complete!"
echo "To activate the environment, run: source venv/bin/activate"
echo "To start the chat service, run: python chat_service.py"
