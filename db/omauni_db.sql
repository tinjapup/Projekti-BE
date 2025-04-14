-- Database: `omauni_db`
DROP DATABASE IF EXISTS omauniDB;
CREATE DATABASE omauniDB;
USE omauniDB;

-- Table structure for table `users`
DROP TABLE IF EXISTS `Users`;
CREATE TABLE Users (
    user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number INT(25) NOT NULL UNIQUE,
    user_level ENUM('admin', 'user') NOT NULL DEFAULT 'user'
);

-- Table structure for table `entries`
DROP TABLE IF EXISTS `Entries`;
CREATE TABLE Entries (
    user_id INT NOT NULL,
    entry_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    bed_time DATETIME NOT NULL,
    asleep_delay INT(50) NOT NULL,
    time_awake INT(50) NOT NULL,
    wakeup_time DATETIME NOT NULL,
    total_sleep INT(50) NOT NULL,
    total_bed_time INT(50) NOT NULL,
    sleep_quality INT(10) NOT NULL,
    daytime_alertness INT(10) NOT NULL,
    sleep_mgmt_methods TEXT,
    sleep_factors TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Alter table `Entries`
ALTER TABLE Entries ADD COLUMN wakeups INT(10) NOT NULL;

-- Alter table `Users`
ALTER TABLE users ADD COLUMN reminder_email VARCHAR(255);
