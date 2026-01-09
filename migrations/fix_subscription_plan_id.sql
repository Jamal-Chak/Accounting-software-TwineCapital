-- Fix: Make plan_id nullable for trial subscriptions
-- Run this in Supabase SQL Editor

ALTER TABLE subscriptions 
ALTER COLUMN plan_id DROP NOT NULL;
