# AgriSaarthi Chat - WSL Setup Guide

## Quick Setup Commands

Run these commands in your WSL terminal:

```bash
# Navigate to project directory
cd "/mnt/c/Users/maith/Desktop/megathon 2k25/megathon_2k25"

# Make scripts executable
chmod +x start-all-wsl.sh
chmod +x backend/setup-venv.sh

# Start everything (this will set up virtual environment and start both services)
./start-all-wsl.sh
```

## Manual Setup (if needed)

If you prefer to set up manually:

```bash
# 1. Install frontend dependencies
npm install

# 2. Setup backend virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 3. Start backend (in one terminal)
cd backend
source venv/bin/activate
python chat_service.py

# 4. Start frontend (in another terminal)
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8005

## Troubleshooting

### If you get permission errors:
```bash
chmod +x *.sh
chmod +x backend/*.sh
```

### If Python virtual environment fails:
```bash
# Install python3-venv if not available
sudo apt update
sudo apt install python3-venv python3-full
```

### If npm fails:
```bash
# Update Node.js if needed
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `scripts/setup-database.sql`
4. Run the SQL script
5. Create a storage bucket named `documents` in Storage section

## Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials (already configured in the code).

## Stopping Services

Press `Ctrl+C` in the terminal where you ran the start script, or manually kill processes:

```bash
# Find and kill processes
ps aux | grep python
ps aux | grep node
kill <PID>
```
