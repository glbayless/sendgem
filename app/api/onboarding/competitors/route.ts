// SendGem - Competitors for Onboarding
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
    const { competitor_name, competitor_website, strengths, weaknesses, notes } = body;

    const { data: competitor, error } = await supabase
      .from('competitor_intel')
      .insert({
        user_id: session.user.id,
        competitor_name,
        competitor_website,
        strengths: strengths || [],
        weaknesses: weaknesses || [],
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    // Update onboarding status
    await supabase
      .from('onboarding_status')
      .upsert({
        user_id: session.user.id,
        competitors_added: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    return NextResponse.json({ competitor });
  } catch (error: any) {
    console.error('Competitor error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET competitors
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: competitors } = await supabase
      .from('competitor_intel')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ competitors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}