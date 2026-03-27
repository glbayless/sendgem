// SendGem - Prospects API Route
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');
    const company = searchParams.get('company');

    let query = supabase
      .from('prospects')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit);

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
    }

    if (company) {
      query = query.eq('company', company);
    }

    const { data: prospects, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get total count
    const { count } = await supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id);

    return NextResponse.json({
      prospects,
      total: count || 0,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('GET prospects error:', error);
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
    const { prospects } = body;

    // Single prospect or batch
    if (Array.isArray(prospects)) {
      const prospectsData = prospects.map(p => ({
        user_id: session.user.id,
        email: p.email,
        first_name: p.firstName || p.first_name,
        last_name: p.lastName || p.last_name,
        company: p.company,
        title: p.title,
        linkedin_url: p.linkedinUrl || p.linkedin_url,
        website: p.website,
        custom_fields: p.customFields || p.custom_fields || {},
      }));

      const { data, error } = await supabase
        .from('prospects')
        .insert(prospectsData)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ prospects: data, imported: data.length });
    } else {
      // Single prospect
      const { data, error } = await supabase
        .from('prospects')
        .insert({
          user_id: session.user.id,
          email: body.email,
          first_name: body.firstName,
          last_name: body.lastName,
          company: body.company,
          title: body.title,
          linkedin_url: body.linkedinUrl,
          website: body.website,
          custom_fields: body.customFields || {},
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ prospect: data });
    }
  } catch (error: any) {
    console.error('POST prospects error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}