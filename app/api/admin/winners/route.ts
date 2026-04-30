import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check admin role
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Simple query first - no joins to avoid potential join errors
    const { data: winners, error } = await (supabase
      .from('winners') as any)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Winners error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Then get user details and draw details separately
    const winnersWithDetails = await Promise.all(
      ((winners || []) as any[]).map(async (winner: any) => {
        const { data: userData } = await (supabase
          .from('users') as any)
          .select('full_name, email')
          .eq('id', winner.user_id)
          .single()

        // Also fetch draw details
        const { data: entryData } = await (supabase
          .from('draw_entries') as any)
          .select('draw_id')
          .eq('id', winner.draw_entry_id)
          .single()
        
        let drawData = null
        if (entryData) {
          const { data: d } = await (supabase
            .from('draws') as any)
            .select('month')
            .eq('id', entryData.draw_id)
            .single()
          drawData = d
        }

        return {
          ...winner,
          user: userData,
          draw: drawData,
        }
      })
    )

    return NextResponse.json({ 
      winners: winnersWithDetails 
    })

  } catch (error) {
    console.error('Winners fetch failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
