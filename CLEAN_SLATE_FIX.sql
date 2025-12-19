-- Clean slate fix - drop all policies and recreate

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow bot profile creation" ON profiles;
DROP POLICY IF EXISTS "Allow all profiles" ON profiles;

DROP POLICY IF EXISTS "Users can view chats they participate in" ON chats;
DROP POLICY IF EXISTS "Users can create chats" ON chats;
DROP POLICY IF EXISTS "Users can update chats they participate in" ON chats;
DROP POLICY IF EXISTS "Users can manage their chats" ON chats;
DROP POLICY IF EXISTS "Allow all chats" ON chats;

DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can manage messages in their chats" ON messages;
DROP POLICY IF EXISTS "Allow bot messages" ON messages;
DROP POLICY IF EXISTS "Allow all messages" ON messages;

-- Disable RLS completely
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
