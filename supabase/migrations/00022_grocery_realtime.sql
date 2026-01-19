-- Enable Realtime for grocery_lists table
-- This allows the frontend to receive live updates when items are added via AI

ALTER PUBLICATION supabase_realtime ADD TABLE grocery_lists;
