#!/bin/bash
echo "Starting Bhashini Backend on port 8000..."
cd backend
export PORT=8000
python3 app.py
