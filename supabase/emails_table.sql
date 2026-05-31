-- Create emails table
CREATE TABLE emails (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    "sentAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "isRead" BOOLEAN DEFAULT FALSE,
    "isStarred" BOOLEAN DEFAULT FALSE,
    "isOutbound" BOOLEAN DEFAULT TRUE,
    "messageId" TEXT,
    "cc" TEXT,
    "bcc" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Policy to allow admins to view all emails
CREATE POLICY "Admins can view all emails" ON emails
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'admin'
    );

-- Policy to allow admins to insert emails
CREATE POLICY "Admins can insert emails" ON emails
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.role() = 'admin'
    );

-- Policy to allow admins to update emails
CREATE POLICY "Admins can update emails" ON emails
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'admin'
    );

-- Policy to allow admins to delete emails
CREATE POLICY "Admins can delete emails" ON emails
    FOR DELETE
    TO authenticated
    USING (
        auth.role() = 'admin'
    ); 