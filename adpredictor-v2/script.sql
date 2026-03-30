CREATE TABLE IF NOT EXISTS scheduled_posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    title VARCHAR(255),
    platform VARCHAR(50) NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    video_filename VARCHAR(255),
    caption TEXT,
    hashtags TEXT,
    status VARCHAR(20) DEFAULT 'scheduled',
    notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);