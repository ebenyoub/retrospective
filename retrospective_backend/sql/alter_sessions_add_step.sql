-- Migration: add step column to sessions table to track retrospective workflow stages
ALTER TABLE sessions ADD COLUMN step ENUM('waiting', 'writing', 'voting', 'results') NOT NULL DEFAULT 'waiting';
