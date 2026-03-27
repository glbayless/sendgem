// SendGem - Onboarding API Routes
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET onboarding status
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: status } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    return NextResponse.json({ status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}