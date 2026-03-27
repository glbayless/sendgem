// SendGem - Company Profile Onboarding
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      tagline,
      industry,
      target_audience,
      pain_points,
      unique_value_proposition,
      website_url,
      linkedin_url,
    } = body;

    // Check if profile exists
    const { data: existing } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    let profile;
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('company_profiles')
        .update({
          name,
          tagline,
          industry,
          target_audience,
          pain_points: pain_points ? pain_points.split(',').map((p: string) => p.trim()) : [],
          unique_value_proposition,
          website_url,
          linkedin_url,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) throw error;
      profile = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('company_profiles')
        .insert({
          user_id: session.user.id,
          name,
          tagline,
          industry,
          target_audience,
          pain_points: pain_points ? pain_points.split(',').map((p: string) => p.trim()) : [],
          unique_value_proposition,
          website_url,
          linkedin_url,
        })
        .select()
        .single();

      if (error) throw error;
      profile = data;
    }

    // Update onboarding status
    await supabase
      .from('onboarding_status')
      .upsert({
        user_id: session.user.id,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Company profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET company profile
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}