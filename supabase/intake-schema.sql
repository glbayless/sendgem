-- SendGem Enhanced Client Intake Schema
-- Add to your Supabase SQL Editor

-- Company profiles (the business being promoted)
CREATE TABLE public.company_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  industry TEXT,
  target_audience TEXT,
  pain_points TEXT[],
  unique_value_proposition TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  social_links JSONB DEFAULT '{}',
  logo_url TEXT,
  brand_colors JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client documents (pitch decks, one-pagers, case studies)
CREATE TABLE public.client_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT CHECK (category IN ('pitch_deck', 'one_pager', 'case_study', 'product_guide', 'pricing', 'other')),
  is_active BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Website scraping cache (for quick reference)
CREATE TABLE public.website_scrape_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  url TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  key_services TEXT[],
  team_members JSONB DEFAULT '[]',
  recent_news JSONB DEFAULT '[]',
  raw_content TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice/style samples (optional - from their existing emails)
CREATE TABLE public.voice_samples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitor intel (for targeting decisions)
CREATE TABLE public.competitor_intel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  competitor_name TEXT NOT NULL,
  competitor_website TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Onboarding checklist for each client
CREATE TABLE public.onboarding_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  profile_completed BOOLEAN DEFAULT FALSE,
  documents_uploaded BOOLEAN DEFAULT FALSE,
  website_linked BOOLEAN DEFAULT FALSE,
  voice_samples_provided BOOLEAN DEFAULT FALSE,
  competitors_added BOOLEAN DEFAULT FALSE,
  first_campaign_created BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_company_profiles_user_id ON public.company_profiles(user_id);
CREATE INDEX idx_client_documents_user_id ON public.client_documents(user_id);
CREATE INDEX idx_website_scrape_cache_user_id ON public.website_scrape_cache(user_id);
CREATE INDEX idx_voice_samples_user_id ON public.voice_samples(user_id);

-- RLS
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_scrape_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_intel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_status ENABLE ROW LEVEL SECURITY;

-- Company Profiles RLS
CREATE POLICY "Users can CRUD own company profiles" ON public.company_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Client Documents RLS
CREATE POLICY "Users can CRUD own documents" ON public.client_documents
  FOR ALL USING (auth.uid() = user_id);

-- Website Scrape Cache RLS
CREATE POLICY "Users can manage own scrape cache" ON public.website_scrape_cache
  FOR ALL USING (auth.uid() = user_id);

-- Voice Samples RLS
CREATE POLICY "Users can CRUD own voice samples" ON public.voice_samples
  FOR ALL USING (auth.uid() = user_id);

-- Competitor Intel RLS
CREATE POLICY "Users can CRUD own competitor intel" ON public.competitor_intel
  FOR ALL USING (auth.uid() = user_id);

-- Onboarding Status RLS
CREATE POLICY "Users can manage own onboarding" ON public.onboarding_status
  FOR ALL USING (auth.uid() = user_id);