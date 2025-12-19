#!/bin/bash

echo "Starting AgriSaarthi Chat Service..."

# Set environment variables
export SUPABASE_URL="https://fpekoatpefuzwczyarzr.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZWtvYXRwZWZ1endjenlhcnpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTEyNjcsImV4cCI6MjA3NTY2NzI2N30.Y4oh4qMeGTJCgaAC7X3nEgD6fqn6yMXGxXnE2egQ-9o"
export BHASHINI_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTYwNjZiOTNlM2JlYzkwMWZkOGM4Iiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.L9J7i1UDuWvLNzzZZ5AIqydpMdyH2V0kYYitlJUgIFs"
export BHASHINI_BASE_URL="https://canvas.iiit.ac.in"

# Activate virtual environment
source venv/bin/activate

# Start the chat service
python chat_service.py
