-- SoundWave Music Streaming Platform Database Schema

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_artist BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artists table (for verified artists)
CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    stage_name VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    website VARCHAR(500),
    social_links JSONB,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Albums table
CREATE TABLE albums (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
    cover_art_url VARCHAR(500),
    release_date DATE,
    genre VARCHAR(100),
    description TEXT,
    is_single BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Songs table
CREATE TABLE songs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
    album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
    file_url VARCHAR(500) NOT NULL,
    cover_art_url VARCHAR(500),
    duration INTEGER NOT NULL, -- in seconds
    genre VARCHAR(100),
    release_date DATE,
    lyrics TEXT,
    is_explicit BOOLEAN DEFAULT FALSE,
    play_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    file_size BIGINT,
    audio_format VARCHAR(10),
    bitrate INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Playlists table
CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_art_url VARCHAR(500),
    is_public BOOLEAN DEFAULT TRUE,
    is_collaborative BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Playlist songs junction table
CREATE TABLE playlist_songs (
    id SERIAL PRIMARY KEY,
    playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
    song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(playlist_id, song_id)
);

-- User favorites
CREATE TABLE user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, song_id)
);

-- Listening history
CREATE TABLE listening_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration
