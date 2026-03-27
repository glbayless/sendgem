// SendGem - Campaigns API Route
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('campaigns')
      .select('*, email_sequences(*), prospects(*), email_accounts(*)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: campaigns, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaigns });
  } catch (error: any) {
    console.error('GET campaigns error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, status = 'draft' } = body;

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: session.user.id,
        name,
        status,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaign: data });
  } catch (error: any) {
    console.error('POST campaigns error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, status, prospect_count, email_count, reply_count, open_rate } = body;

    const updates: any = { updated_at: new Date().toISOString() };
    if (name) updates.name = name;
    if (status) updates.status = status;
    if (prospect_count !== undefined) updates.prospect_count = prospect_count;
    if (email_count !== undefined) updates.email_count = email_count;
    if (reply_count !== undefined) updates.reply_count = reply_count;
    if (open_rate !== undefined) updates.open_rate = open_rate;

    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaign: data });
  } catch (error: any) {
    console.error('PUT campaigns error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE campaigns error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}