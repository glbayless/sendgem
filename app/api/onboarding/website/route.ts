// SendGem - Website Scraping for Onboarding
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

async function scrapeWebsite(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SendGem/1.0)',
      },
    });
    const html = await response.text();

    // Simple extraction - in production use cheerio or similar
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract main heading
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
    const h1s = h1Match ? h1Match.map(h => h.replace(/<[^>]+>/g, '').trim()) : [];

    // Look for service-related keywords
    const serviceKeywords = ['service', 'solution', 'product', 'offering', 'features', 'benefits'];
    const foundServices: string[] = [];
    
    for (const keyword of serviceKeywords) {
      const regex = new RegExp(`<[^>]*>\\s*${keyword}\\s*<[^>]*>`, 'gi');
      const matches = html.match(regex);
      if (matches) {
        foundServices.push(keyword);
      }
    }

    return {
      title,
      description,
      key_services: foundServices.slice(0, 5),
    };
  } catch (error) {
    console.error('Scraping error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    // Check cache first
    const { data: cached } = await supabase
      .from('website_scrape_cache')
      .select('*')
      .eq('url', url)
      .single();

    if (cached) {
      // Return cached if less than 24 hours old
      const cacheAge = Date.now() - new Date(cached.scraped_at).getTime();
      if (cacheAge < 24 * 60 * 60 * 1000) {
        return NextResponse.json({ scrape: cached, cached: true });
      }
    }

    // Scrape the website
    const scrapeResult = await scrapeWebsite(url);

    if (!scrapeResult) {
      return NextResponse.json({ error: 'Failed to scrape website' }, { status: 500 });
    }

    // Save to database
    const { data: scrape, error } = await supabase
      .from('website_scrape_cache')
      .upsert({
        user_id: session.user.id,
        url,
        title: scrapeResult.title,
        description: scrapeResult.description,
        key_services: scrapeResult.key_services,
        scraped_at: new Date().toISOString(),
      }, { onConflict: 'url' })
      .select()
      .single();

    if (error) throw error;

    // Update onboarding status
    await supabase
      .from('onboarding_status')
      .upsert({
        user_id: session.user.id,
        website_linked: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    return NextResponse.json({ scrape, cached: false });
  } catch (error: any) {
    console.error('Website scrape error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET scraped data
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (url) {
      const { data: scrape } = await supabase
        .from('website_scrape_cache')
        .select('*')
        .eq('url', url)
        .single();
      return NextResponse.json({ scrape });
    } else {
      const { data: scrapes } = await supabase
        .from('website_scrape_cache')
        .select('*')
        .eq('user_id', session.user.id)
        .order('scraped_at', { ascending: false });
      return NextResponse.json({ scrapes });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}