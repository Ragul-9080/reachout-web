-- Create tables for Reachout Academy

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration VARCHAR(100),
    fees DECIMAL(10,2),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificates table
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_name VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    cert_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'Valid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_courses_title ON courses(title);
CREATE INDEX idx_certificates_cert_number ON certificates(cert_number);
CREATE INDEX idx_certificates_student_name ON certificates(student_name);
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Courses: Public read access, admin write access
CREATE POLICY "Public read access" ON courses FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON courses FOR ALL USING (auth.role() = 'authenticated');

-- Certificates: Public read access for verification, admin write access
CREATE POLICY "Public read access" ON certificates FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON certificates FOR ALL USING (auth.role() = 'authenticated');

-- Admin users: Only authenticated users can access
CREATE POLICY "Admin access only" ON admin_users FOR ALL USING (auth.role() = 'authenticated'); 