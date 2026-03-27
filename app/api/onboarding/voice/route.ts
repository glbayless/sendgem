// SendGem - Voice Samples for Onboarding
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
    const { name, content, context } = body;

    const { data: sample, error } = await supabase
      .from('voice_samples')
      .insert({
        user_id: session.user.id,
        name: name || 'My Writing Style',
        content,
        context,
      })
      .select()
      .single();

    if (error) throw error;

    // Update onboarding status
    await supabase
      .from('onboarding_status')
      .upsert({
        user_id: session.user.id,
        voice_samples_provided: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    return NextResponse.json({ sample });
  } catch (error: any) {
    console.error('Voice sample error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET voice samples
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: samples } = await supabase
      .from('voice_samples')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ samples });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}