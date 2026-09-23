-- Database Schema for HEWN Tech Archive

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Archival content
CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id),
  content_type VARCHAR(50),
  image_url VARCHAR(500),
  file_url VARCHAR(500),
  author VARCHAR(100),
  date_created DATE,
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Archive items (specific to Gigar Tesfaye archive)
CREATE TABLE IF NOT EXISTS archive_items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  collection_name VARCHAR(100),
  item_type VARCHAR(50),
  location TEXT,
  year INTEGER,
  image_url VARCHAR(500),
  document_url VARCHAR(500),
  metadata JSONB,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Network/Partners
CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  description TEXT,
  website VARCHAR(255),
  logo_url VARCHAR(500),
  contact_email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge resources
CREATE TABLE IF NOT EXISTS knowledge_resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50),
  content TEXT,
  file_url VARCHAR(500),
  external_link VARCHAR(500),
  category VARCHAR(100),
  author VARCHAR(100),
  published BOOLEAN DEFAULT FALSE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
('Manuscripts', 'Historical Ethiopian manuscripts and documents'),
('Churches', 'Rock-hewn churches and religious sites'),
('Obelisks', 'Ancient stelae and obelisks'),
('Artifacts', 'Cultural artifacts and heritage items'),
('Photographs', 'Historical photographs and images')
ON CONFLICT DO NOTHING;