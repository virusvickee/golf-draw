import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = 
      await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const winnerId = formData.get('winnerId') as string

    if (!file || !winnerId) {
      return NextResponse.json(
        { error: 'Missing file or winner ID' },
        { status: 400 }
      )
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = 
      `${user.id}-${winnerId}-${Date.now()}.${fileExt}`
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { data: uploadData, error: uploadError } = 
      await supabase.storage
        .from('winner-proofs')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true,
        })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Upload failed' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('winner-proofs')
      .getPublicUrl(fileName)

    // Update winner record with proof URL
    const { error: updateError } = await (supabase
      .from('winners') as any)
      .update({ 
        proof_url: publicUrl,
        verification_status: 'pending'
      })
      .eq('id', winnerId)
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to save proof URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      proof_url: publicUrl 
    })

  } catch (error) {
    console.error('Proof upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
