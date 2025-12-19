# 🗄️ Supabase Database Setup

## Step 1: Go to your Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project: `fpekoatpefuzwczyarzr`
3. Go to **SQL Editor**

## Step 2: Run this SQL script

Copy and paste this entire script into the SQL Editor and click **Run**:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT,
    language TEXT DEFAULT 'en',
    region TEXT,
    crops TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_a UUID REFERENCES profiles(id),
    participant_b UUID REFERENCES profiles(id),
    last_message TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'audio', 'document')),
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for chats
CREATE POLICY "Users can view chats they participate in" ON chats
    FOR SELECT USING (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Users can create chats" ON chats
    FOR INSERT WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Users can update chats they participate in" ON chats
    FOR UPDATE USING (auth.uid() = participant_a OR auth.uid() = participant_b);

-- Create RLS policies for messages
CREATE POLICY "Users can view messages in their chats" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.participant_a = auth.uid() OR chats.participant_b = auth.uid())
        )
    );

CREATE POLICY "Users can insert messages in their chats" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chats 
            WHERE chats.id = messages.chat_id 
            AND (chats.participant_a = auth.uid() OR chats.participant_b = auth.uid())
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chats_participant_a ON chats(participant_a);
CREATE INDEX IF NOT EXISTS idx_chats_participant_b ON chats(participant_b);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Create function to update chat's last_message and updated_at
CREATE OR REPLACE FUNCTION update_chat_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chats 
    SET 
        last_message = NEW.content,
        updated_at = NOW()
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update chat when new message is inserted
CREATE TRIGGER trigger_update_chat_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_on_message();
```

## Step 3: Create Storage Bucket
1. Go to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Name it: `documents`
4. Make it **Public** (for file sharing)
5. Click **Create bucket**

## Step 4: Test the Application
1. Go to http://localhost:3000
2. Sign up with a new account
3. Check your Supabase dashboard → **Table Editor** → **profiles** to see your data
4. Start a chat and check **messages** table
5. All your data will be saved in Supabase! 🎉

## What gets saved:
- ✅ **User profiles** (name, phone, language, region, crops)
- ✅ **Chat conversations** (between users and bot)
- ✅ **All messages** (with timestamps)
- ✅ **File uploads** (in Storage bucket)
- ✅ **Real-time updates** (messages appear instantly)

Your data is now persistent and will survive page refreshes! 🚀
