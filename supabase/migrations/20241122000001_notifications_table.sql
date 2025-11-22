-- Create notifications table for seller dashboard
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by seller_id
CREATE INDEX IF NOT EXISTS idx_notifications_seller_id ON notifications(seller_id);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy for sellers to read their own notifications
CREATE POLICY "Sellers can view own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = seller_id);
