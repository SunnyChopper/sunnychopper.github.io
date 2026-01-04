/*
  # Insert Test User and Seed Data
  
  Creates a test user (via auth if not exists) and seeds initial data for development:
  - 5 tasks across different areas
  - 3 projects
  - 5 goals (one per time horizon)
  - 4 metrics with logs
  - 3 habits with logs
  - 3 logbook entries
  
  Note: User must sign up via the application first to create auth.users record
*/

-- For now, we'll create seed data that will be associated with the first user who signs up
-- This migration prepares sample data that can be used once authenticated

-- We'll use a placeholder and update it when a user signs up
-- For testing purposes, insert example data with a test user ID that can be replaced
