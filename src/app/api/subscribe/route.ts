import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for email subscriptions to bypass RLS
const supabaseAdmin = createClient(
  process.env.SNOBOL_SUPABASE_URL!,
  process.env.SNOBOL_SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    console.log('Attempting to insert email:', email)

    // Insert email into Supabase using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('snobol_email_subscribers')
      .insert([
        { 
          email: email.toLowerCase().trim(),
          subscribed_at: new Date().toISOString()
        }
      ])
      .select()

    console.log('Supabase response:', { data, error })

    if (error) {
      console.error('Supabase error:', error)
      
      // Handle duplicate email error
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'Email already subscribed!' },
          { status: 200 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to subscribe email', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Successfully subscribed!', data },
      { status: 201 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
