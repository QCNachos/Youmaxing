-- Add unique constraint on user_id and aspect for conversations
-- This allows upsert operations to work correctly for persistent chat history

-- First, clean up any duplicate entries (keep most recent)
DELETE FROM conversations a USING conversations b
WHERE a.id < b.id 
  AND a.user_id = b.user_id 
  AND a.aspect = b.aspect;

-- Add unique constraint
ALTER TABLE conversations 
ADD CONSTRAINT conversations_user_aspect_unique 
UNIQUE (user_id, aspect);

-- Add updated_at column for better tracking
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_user_aspect 
ON conversations(user_id, aspect);
