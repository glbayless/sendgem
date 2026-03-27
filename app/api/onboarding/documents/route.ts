// SendGem - Document Upload for Onboarding
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get company profile
    const { data: profile } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'No company profile found' }, { status: 400 });
    }

    // Save file to disk (in production, use S3/Blob storage)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', session.user.id);
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, `${Date.now()}-${file.name}`);
    await writeFile(filePath, buffer);

    // Save to database
    const { data: doc, error } = await supabase
      .from('client_documents')
      .insert({
        user_id: session.user.id,
        company_profile_id: profile.id,
        name,
        description: '',
        file_url: `/uploads/${session.user.id}/${path.basename(filePath)}`,
        file_type: file.type,
        category,
      })
      .select()
      .single();

    if (error) throw error;

    // Update onboarding status
    await supabase
      .from('onboarding_status')
      .upsert({
        user_id: session.user.id,
        documents_uploaded: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    return NextResponse.json({ document: doc });
  } catch (error: any) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET documents
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: documents } = await supabase
      .from('client_documents')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .order('uploaded_at', { ascending: false });

    return NextResponse.json({ documents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}