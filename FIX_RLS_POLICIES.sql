-- Fix RLS policies for profile creation during signup

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create new policies that allow profile creation
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- This is the key fix - allow profile creation for authenticated users
CREATE POLICY "Authenticated users can insert profiles" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Also allow the bot to create profiles (for system users)
CREATE POLICY "Allow bot profile creation" ON profiles
    FOR INSERT WITH CHECK (true);

-- Fix chats policies
DROP POLICY IF EXISTS "Users can view chats they participate in" ON chats;
DROP POLICY IF EXISTS "Users can create chats" ON chats;
DROP POLICY IF EXISTS "Users can update chats they participate in" ON chats;

CREATE POLICY "Users can view chats they participate in" ON chats
    FOR SELECT USING (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Users can create chats" ON chats
    FOR INSERT WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Users can update chats they participate in" ON chats
    FOR UPDATE USING (auth.uid() = participant_a OR auth.uid() = participant_b);

-- Fix messages policies
DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their chats" ON messages;

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

-- Allow bot to send messages
CREATE POLICY "Allow bot messages" ON messages
    FOR INSERT WITH CHECK (sender_id = 'bot-agrisaarthi' OR auth.uid() = sender_id);
