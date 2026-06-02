-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'clerk', 'admin', 'dsw')),
    name VARCHAR(255),
    contact_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create grievances table
CREATE TABLE grievances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under-review', 'in-progress', 'resolved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_to UUID REFERENCES users(id),
    documents TEXT[],
    feedback TEXT
);

-- Create responses table
CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grievance_id UUID NOT NULL REFERENCES grievances(id),
    admin_id UUID NOT NULL REFERENCES users(id),
    response_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create statistics table
CREATE TABLE statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resolution_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    avg_response_time INTEGER NOT NULL DEFAULT 0,
    grievances_resolved INTEGER NOT NULL DEFAULT 0,
    user_satisfaction DECIMAL(5,2) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_grievances_user_id ON grievances(user_id);
CREATE INDEX idx_grievances_status ON grievances(status);
CREATE INDEX idx_responses_grievance_id ON responses(grievance_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Set up Row-Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
-- Users can only view and update their own profiles
CREATE POLICY "Users can view own profiles" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profiles" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" 
  ON users FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'dsw')
    )
  );

-- Create policies for grievances table
-- Students can only view and update their own grievances
CREATE POLICY "Users can view own grievances" 
  ON grievances FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own grievances" 
  ON grievances FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own grievances" 
  ON grievances FOR UPDATE 
  USING (user_id = auth.uid() AND status = 'pending');

-- Admins, DSW, and clerks can view and manage all grievances
CREATE POLICY "Staff can view all grievances" 
  ON grievances FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'dsw', 'clerk')
    )
  );

CREATE POLICY "Staff can update all grievances" 
  ON grievances FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'dsw', 'clerk')
    )
  );

-- Create policies for responses table
-- Students can only view responses to their grievances
CREATE POLICY "Users can view responses to their grievances" 
  ON responses FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM grievances WHERE id = grievance_id AND user_id = auth.uid()
    )
  );

-- Staff can add and view all responses
CREATE POLICY "Staff can insert responses" 
  ON responses FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'dsw', 'clerk')
    )
  );

CREATE POLICY "Staff can view all responses" 
  ON responses FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'dsw', 'clerk')
    )
  );

-- Create policies for statistics table
-- Everyone can view statistics
CREATE POLICY "Anyone can view statistics" 
  ON statistics FOR SELECT 
  USING (true);

-- Only admins can update statistics
CREATE POLICY "Only admins can update statistics" 
  ON statistics FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert statistics" 
  ON statistics FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to automatically update grievance timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_grievances_updated_at
BEFORE UPDATE ON grievances
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create initial statistics record
INSERT INTO statistics (resolution_rate, avg_response_time, grievances_resolved, user_satisfaction)
VALUES (0, 0, 0, 0);

-- Create function to update statistics when grievances are resolved
CREATE OR REPLACE FUNCTION update_statistics_on_resolution()
RETURNS TRIGGER AS $$
DECLARE
  total_resolved INTEGER;
  total_grievances INTEGER;
  avg_time NUMERIC;
BEGIN
  -- Only proceed if status changed to 'resolved'
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    -- Count total resolved grievances
    SELECT COUNT(*) INTO total_resolved
    FROM grievances
    WHERE status = 'resolved';
    
    -- Count total grievances
    SELECT COUNT(*) INTO total_grievances
    FROM grievances;
    
    -- Calculate average response time (in days)
    SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400) INTO avg_time
    FROM grievances
    WHERE status = 'resolved';
    
    -- Update statistics
    UPDATE statistics
    SET 
      resolution_rate = CASE WHEN total_grievances > 0 THEN (total_resolved::NUMERIC / total_grievances) * 100 ELSE 0 END,
      avg_response_time = COALESCE(avg_time, 0),
      grievances_resolved = total_resolved,
      last_updated = now();
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_resolution
AFTER UPDATE ON grievances
FOR EACH ROW
EXECUTE FUNCTION update_statistics_on_resolution(); 