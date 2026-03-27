-- SendGem Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'agency')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prospects table
CREATE TABLE public.prospects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  title TEXT,
  linkedin_url TEXT,
  website TEXT,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  prospect_count INTEGER DEFAULT 0,
  email_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  open_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email sequences table
CREATE TABLE public.email_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  subject_line TEXT NOT NULL,
  email_body TEXT NOT NULL,
  send_delay_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email accounts table
CREATE TABLE public.email_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  smtp_host TEXT,
  smtp_port TEXT,
  smtp_user TEXT,
  smtp_password TEXT,
  is_warmed BOOLEAN DEFAULT FALSE,
  warmup_score INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 50,
  used_today INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email logs table (for tracking opens/clicks)
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  email_account_id UUID REFERENCES public.email_accounts(id) ON DELETE CASCADE NOT NULL,
  subject_line TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ
);

-- Waitlist table
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_prospects_user_id ON public.prospects(user_id);
CREATE INDEX idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX idx_email_sequences_campaign_id ON public.email_sequences(campaign_id);
CREATE INDEX idx_email_logs_prospect_id ON public.email_logs(prospect_id);
CREATE INDEX idx_email_logs_campaign_id ON public.email_logs(campaign_id);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Prospects RLS
CREATE POLICY "Users can CRUD own prospects" ON public.prospects
  FOR ALL USING (auth.uid() = user_id);

-- Campaigns RLS
CREATE POLICY "Users can CRUD own campaigns" ON public.campaigns
  FOR ALL USING (auth.uid() = user_id);

-- Email sequences RLS
CREATE POLICY "Users can CRUD own sequences" ON public.email_sequences
  FOR ALL USING (auth.uid() = user_id);

-- Email accounts RLS
CREATE POLICY "Users can CRUD own accounts" ON public.email_accounts
  FOR ALL USING (auth.uid() = user_id);

-- Email logs RLS
CREATE POLICY "Users can view own email logs" ON public.email_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = email_logs.campaign_id AND c.user_id = auth.uid()
    )
  );

-- Waitlist RLS (public read, auth write)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view waitlist" ON public.waitlist
  FOR SELECT USING (true);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();