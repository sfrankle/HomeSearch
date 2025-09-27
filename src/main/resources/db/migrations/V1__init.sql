-- Initial migration: Create user_settings table with default data

CREATE TABLE user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language TEXT NOT NULL DEFAULT 'en',
    measurement_system TEXT NOT NULL DEFAULT 'metric', -- 'metric' or 'imperial'
    currency TEXT NOT NULL DEFAULT 'EUR',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default user settings
INSERT INTO user_settings (language, measurement_system, currency) 
VALUES ('en', 'metric', 'EUR');
