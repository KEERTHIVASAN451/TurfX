-- ============================================================
-- TurfX Database
-- Turf & Tournament Management System
-- ============================================================

CREATE DATABASE IF NOT EXISTS turfx
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE turfx;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. ROLES
-- ============================================================

DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ============================================================
-- 2. USERS
-- ============================================================

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id INT UNSIGNED NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255),
    status ENUM('active', 'inactive', 'blocked') NOT NULL DEFAULT 'active',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    INDEX idx_users_role (role_id),
    INDEX idx_users_status (status)
) ENGINE=InnoDB;


-- ============================================================
-- 3. TURFS
-- ============================================================

DROP TABLE IF EXISTS turfs;

CREATE TABLE turfs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    owner_id INT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    pincode VARCHAR(10),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(150),
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    image VARCHAR(255),
    facilities JSON NULL,
    status ENUM('active', 'inactive', 'maintenance')
        NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_turfs_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    INDEX idx_turfs_owner (owner_id),
    INDEX idx_turfs_city (city),
    INDEX idx_turfs_status (status)
) ENGINE=InnoDB;


-- ============================================================
-- 4. TURF SLOTS
-- ============================================================

DROP TABLE IF EXISTS turf_slots;

CREATE TABLE turf_slots (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    turf_id INT UNSIGNED NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('available', 'booked', 'blocked', 'maintenance')
        NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_slots_turf
        FOREIGN KEY (turf_id)
        REFERENCES turfs(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    UNIQUE KEY unique_turf_slot (
        turf_id,
        slot_date,
        start_time,
        end_time
    ),

    INDEX idx_slots_date (slot_date),
    INDEX idx_slots_status (status)
) ENGINE=InnoDB;


-- ============================================================
-- 5. BOOKINGS
-- ============================================================

DROP TABLE IF EXISTS bookings;

CREATE TABLE bookings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(50) NOT NULL UNIQUE,
    user_id INT UNSIGNED NOT NULL,
    turf_id INT UNSIGNED NOT NULL,
    slot_id INT UNSIGNED NOT NULL,
    booking_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM(
        'pending',
        'confirmed',
        'cancelled',
        'completed',
        'refunded'
    ) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_bookings_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_bookings_turf
        FOREIGN KEY (turf_id)
        REFERENCES turfs(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_bookings_slot
        FOREIGN KEY (slot_id)
        REFERENCES turf_slots(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    INDEX idx_bookings_user (user_id),
    INDEX idx_bookings_turf (turf_id),
    INDEX idx_bookings_date (booking_date),
    INDEX idx_bookings_status (status)
) ENGINE=InnoDB;


-- ============================================================
-- 6. PAYMENTS
-- ============================================================

DROP TABLE IF EXISTS payments;

CREATE TABLE payments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    transaction_id VARCHAR(150) UNIQUE,
    payment_method ENUM(
        'cash',
        'upi',
        'card',
        'netbanking',
        'wallet'
    ) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status ENUM(
        'pending',
        'success',
        'failed',
        'refunded'
    ) NOT NULL DEFAULT 'pending',
    payment_gateway VARCHAR(50),
    gateway_response JSON NULL,
    paid_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_payments_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    INDEX idx_payments_booking (booking_id),
    INDEX idx_payments_user (user_id),
    INDEX idx_payments_status (status)
) ENGINE=InnoDB;


-- ============================================================
-- 7. EQUIPMENT
-- ============================================================

DROP TABLE IF EXISTS equipment;

CREATE TABLE equipment (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    turf_id INT UNSIGNED NOT NULL,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    category VARCHAR(80),
    quantity INT NOT NULL DEFAULT 0,
    available_quantity INT NOT NULL DEFAULT 0,
    rental_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    image VARCHAR(255),
    status ENUM('available', 'unavailable')
        NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_equipment_turf
        FOREIGN KEY (turf_id)
        REFERENCES turfs(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    INDEX idx_equipment_turf (turf_id),
    INDEX idx_equipment_status (status)
) ENGINE=InnoDB;


-- ============================================================
-- 8. TEAMS
-- ============================================================

DROP TABLE IF EXISTS teams;

CREATE TABLE teams (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    captain_id INT UNSIGNED NOT NULL,
    name VARCHAR(120) NOT NULL,
    short_name VARCHAR(20),
    logo VARCHAR(255),
    description TEXT,
    city VARCHAR(100),
    invite_code VARCHAR(50) NOT NULL UNIQUE,
    status ENUM('active', 'inactive')
        NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_teams_captain
        FOREIGN KEY (captain_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    INDEX idx_teams_captain (captain_id)
) ENGINE=InnoDB;


-- ============================================================
-- 9. PLAYERS
-- ============================================================

DROP TABLE IF EXISTS players;

CREATE TABLE players (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NULL,
    team_id INT UNSIGNED NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(150),
    date_of_birth DATE NULL,
    photo VARCHAR(255),
    role ENUM(
        'batsman',
        'bowler',
        'all_rounder',
        'wicket_keeper'
    ) DEFAULT 'all_rounder',
    batting_style VARCHAR(50),
    bowling_style VARCHAR(80),
    jersey_number INT NULL,
    status ENUM('active', 'inactive')
        NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_players_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_players_team
        FOREIGN KEY (team_id)
        REFERENCES teams(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    INDEX idx_players_team (team_id),
    INDEX idx_players_user (user_id)
) ENGINE=InnoDB;


-- ============================================================
-- 10. TOURNAMENTS
-- ============================================================

DROP TABLE IF EXISTS tournaments;

CREATE TABLE tournaments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organizer_id INT UNSIGNED NOT NULL,
    turf_id INT UNSIGNED NULL,
    name VARCHAR(180) NOT NULL,
    description TEXT,
    format ENUM(
        't10',
        't20',
        't30',
        't40',
        't50',
        'custom'
    ) NOT NULL DEFAULT 't20',
    tournament_type ENUM(
        'league',
        'knockout',
        'league_knockout',
        'round_robin'
    ) NOT NULL DEFAULT 'league_knockout',
    entry_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    prize_pool DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    max_teams INT NOT NULL DEFAULT 8,
    registration_start DATETIME,
    registration_end DATETIME,
    start_date DATE NOT NULL,
    end_date DATE,
    venue VARCHAR(255),
    rules TEXT,
    banner VARCHAR(255),
    status ENUM(
        'draft',
        'open',
        'registration_closed',
        'ongoing',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_tournaments_organizer
        FOREIGN KEY (organizer_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_tournaments_turf
        FOREIGN KEY (turf_id)
        REFERENCES turfs(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    INDEX idx_tournaments_organizer (organizer_id),
    INDEX idx_tournaments_status (status),
    INDEX idx_tournaments_start_date (start_date)
) ENGINE=InnoDB;


-- ============================================================
-- 11. TOURNAMENT REGISTRATIONS
-- ============================================================

DROP TABLE IF EXISTS tournament_registrations;

CREATE TABLE tournament_registrations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT UNSIGNED NOT NULL,
    team_id INT UNSIGNED NOT NULL,
    registered_by INT UNSIGNED NOT NULL,
    registration_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_status ENUM(
        'pending',
        'paid',
        'failed',
        'refunded'
    ) NOT NULL DEFAULT 'pending',
    status ENUM(
        'pending',
        'approved',
        'rejected',
        'withdrawn'
    ) NOT NULL DEFAULT 'pending',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_registration_tournament
        FOREIGN KEY (tournament_id)
        REFERENCES tournaments(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_registration_team
        FOREIGN KEY (team_id)
        REFERENCES teams(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_registration_user
        FOREIGN KEY (registered_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    UNIQUE KEY unique_tournament_team (
        tournament_id,
        team_id
    ),

    INDEX idx_registration_tournament (tournament_id),
    INDEX idx_registration_team (team_id)
) ENGINE=InnoDB;


-- ============================================================
-- 12. FIXTURES
-- ============================================================

DROP TABLE IF EXISTS fixtures;

CREATE TABLE fixtures (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT UNSIGNED NOT NULL,
    match_number INT NOT NULL,
    stage VARCHAR(50) NOT NULL,
    group_name VARCHAR(50),
    team_a_id INT UNSIGNED NULL,
    team_b_id INT UNSIGNED NULL,
    scheduled_date DATE,
    scheduled_time TIME,
    venue VARCHAR(255),
    status ENUM(
        'scheduled',
        'live',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_fixtures_tournament
        FOREIGN KEY (tournament_id)
        REFERENCES tournaments(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_fixtures_team_a
        FOREIGN KEY (team_a_id)
        REFERENCES teams(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_fixtures_team_b
        FOREIGN KEY (team_b_id)
        REFERENCES teams(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    UNIQUE KEY unique_match_number (
        tournament_id,
        match_number
    ),

    INDEX idx_fixtures_tournament (tournament_id),
    INDEX idx_fixtures_date (scheduled_date)
) ENGINE=InnoDB;


-- ============================================================
-- 13. MATCHES
-- ============================================================

DROP TABLE IF EXISTS matches;

CREATE TABLE matches (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fixture_id INT UNSIGNED NOT NULL UNIQUE,
    toss_winner_team_id INT UNSIGNED NULL,
    toss_decision ENUM('bat', 'bowl') NULL,
    winner_team_id INT UNSIGNED NULL,
    result_text VARCHAR(255),
    man_of_the_match_player_id INT UNSIGNED NULL,
    started_at DATETIME NULL,
    completed_at DATETIME NULL,
    status ENUM(
        'not_started',
        'live',
        'completed',
        'abandoned'
    ) NOT NULL DEFAULT 'not_started',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_matches_fixture
        FOREIGN KEY (fixture_id)
        REFERENCES fixtures(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_matches_toss_winner
        FOREIGN KEY (toss_winner_team_id)
        REFERENCES teams(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_matches_winner
        FOREIGN KEY (winner_team_id)
        REFERENCES teams(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_matches_mom
        FOREIGN KEY (man_of_the_match_player_id)
        REFERENCES players(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;


-- ============================================================
-- 14. INNINGS
-- ============================================================

DROP TABLE IF EXISTS innings;

CREATE TABLE innings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    match_id INT UNSIGNED NOT NULL,
    batting_team_id INT UNSIGNED NOT NULL,
    bowling_team_id INT UNSIGNED NOT NULL,
    innings_number INT NOT NULL,
    total_runs INT NOT NULL DEFAULT 0,
    total_wickets INT NOT NULL DEFAULT 0,
    total_overs DECIMAL(5,1) NOT NULL DEFAULT 0.0,
    extras INT NOT NULL DEFAULT 0,
    status ENUM(
        'not_started',
        'live',
        'completed'
    ) NOT NULL DEFAULT 'not_started',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_innings_match
        FOREIGN KEY (match_id)
        REFERENCES matches(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_innings_batting_team
        FOREIGN KEY (batting_team_id)
        REFERENCES teams(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_innings_bowling_team
        FOREIGN KEY (bowling_team_id)
        REFERENCES teams(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    UNIQUE KEY unique_match_innings (
        match_id,
        innings_number
    )
) ENGINE=InnoDB;


-- ============================================================
-- 15. SCORECARDS
-- ============================================================

DROP TABLE IF EXISTS scorecards;

CREATE TABLE scorecards (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    innings_id INT UNSIGNED NOT NULL,
    player_id INT UNSIGNED NOT NULL,
    runs INT NOT NULL DEFAULT 0,
    balls_faced INT NOT NULL DEFAULT 0,
    fours INT NOT NULL DEFAULT 0,
    sixes INT NOT NULL DEFAULT 0,
    wickets INT NOT NULL DEFAULT 0,
    overs_bowled DECIMAL(5,1) NOT NULL DEFAULT 0.0,
    runs_conceded INT NOT NULL DEFAULT 0,
    maidens INT NOT NULL DEFAULT 0,
    catches INT NOT NULL DEFAULT 0,
    stumpings INT NOT NULL DEFAULT 0,
    run_outs INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_scorecards_innings
        FOREIGN KEY (innings_id)
        REFERENCES innings(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_scorecards_player
        FOREIGN KEY (player_id)
        REFERENCES players(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    UNIQUE KEY unique_innings_player (
        innings_id,
        player_id
    )
) ENGINE=InnoDB;


-- ============================================================
-- 16. LEADERBOARDS
-- ============================================================

DROP TABLE IF EXISTS leaderboards;

CREATE TABLE leaderboards (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT UNSIGNED NOT NULL,
    player_id INT UNSIGNED NOT NULL,
    matches_played INT NOT NULL DEFAULT 0,
    runs INT NOT NULL DEFAULT 0,
    wickets INT NOT NULL DEFAULT 0,
    catches INT NOT NULL DEFAULT 0,
    highest_score INT NOT NULL DEFAULT 0,
    best_bowling VARCHAR(30),
    strike_rate DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    economy DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_leaderboards_tournament
        FOREIGN KEY (tournament_id)
        REFERENCES tournaments(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_leaderboards_player
        FOREIGN KEY (player_id)
        REFERENCES players(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    UNIQUE KEY unique_tournament_player (
        tournament_id,
        player_id
    )
) ENGINE=InnoDB;


-- ============================================================
-- 17. CERTIFICATES
-- ============================================================

DROP TABLE IF EXISTS certificates;

CREATE TABLE certificates (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT UNSIGNED NOT NULL,
    player_id INT UNSIGNED NULL,
    team_id INT UNSIGNED NULL,
    certificate_type ENUM(
        'winner',
        'runner_up',
        'participation',
        'best_batsman',
        'best_bowler',
        'man_of_the_match',
        'custom'
    ) NOT NULL,
    certificate_number VARCHAR(100) NOT NULL UNIQUE,
    file_path VARCHAR(255),
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_certificates_tournament
        FOREIGN KEY (tournament_id)
        REFERENCES tournaments(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_certificates_player
        FOREIGN KEY (player_id)
        REFERENCES players(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_certificates_team
        FOREIGN KEY (team_id)
        REFERENCES teams(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    INDEX idx_certificates_tournament (tournament_id)
) ENGINE=InnoDB;


-- ============================================================
-- 18. NOTIFICATIONS
-- ============================================================

DROP TABLE IF EXISTS notifications;

CREATE TABLE notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    related_id INT UNSIGNED NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (is_read)
) ENGINE=InnoDB;


-- ============================================================
-- 19. AUDIT LOGS
-- ============================================================

DROP TABLE IF EXISTS audit_logs;

CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100),
    table_name VARCHAR(100),
    record_id BIGINT UNSIGNED NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    INDEX idx_audit_user (user_id),
    INDEX idx_audit_module (module),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;


-- ============================================================
-- DEFAULT ROLES
-- ============================================================

INSERT INTO roles (name, description) VALUES
('user', 'Normal TurfX customer'),
('admin', 'Turf owner / administrator'),
('organizer', 'Tournament organizer');


-- ============================================================
-- FINISH
-- ============================================================

SET FOREIGN_KEY_CHECKS = 1;