import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const donationSchema = z.object({
  charity_id: z.string().uuid(),
  amount: z.number().min(1).max(10000),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Please login to donate' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { charity_id, amount } = donationSchema.parse(body)

    // Record donation in contributions table
    // We use any casting to avoid potential 'never' type mismatch during build
    const { error } = await (supabase
      .from('contributions') as any)
      .insert({
        user_id: user.id,
        charity_id,
        amount,
        percentage: 0, // 0 = independent donation
      })

    if (error) {
      console.error('Donation error:', error)
      return NextResponse.json(
        { error: 'Donation failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Thank you for your donation!'
    })

  } catch (error) {
    console.error('Donation request failed:', error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
