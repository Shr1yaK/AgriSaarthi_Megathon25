# Supabase Database Setup for AgriSaarthi Chat

## Prerequisites
1. Supabase project created at https://supabase.com
2. Project URL and API keys available

## Database Setup Steps

### 1. Create Tables
Run the SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of setup-database.sql
```

### 2. Environment Variables
Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fpekoatpefuzwczyarzr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZWtvYXRwZWZ1endjenlhcnpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTEyNjcsImV4cCI6MjA3NTY2NzI2N30.Y4oh4qMeGTJCgaAC7X3nEgD6fqn6yMXGxXnE2egQ-9o
```

### 3. Storage Bucket
Create a storage bucket named `documents` for file uploads:

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `documents`
3. Set it to public if you want public access to uploaded files

### 4. Authentication Setup
1. Go to Authentication > Settings in your Supabase dashboard
2. Enable Email authentication
3. Configure your site URL (e.g., http://localhost:3000 for development)

### 5. Row Level Security (RLS)
The SQL script automatically sets up RLS policies, but you can verify them in the Supabase dashboard under Authentication > Policies.

## Testing the Setup

1. Start the application: `npm run dev`
2. Create a new account
3. Start a chat with the bot
4. Send a message and verify the bot responds

## Troubleshooting

### Common Issues:
1. **Authentication errors**: Check your Supabase URL and API keys
2. **RLS errors**: Ensure RLS policies are properly configured
3. **Storage errors**: Verify the `documents` bucket exists and is accessible
4. **Bot not responding**: Check that the backend service is running on port 8005

### Debug Steps:
1. Check browser console for errors
2. Verify Supabase connection in the Network tab
3. Check backend logs for bot service errors
4. Ensure all environment variables are set correctly
