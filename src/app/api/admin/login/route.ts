import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Simple hardcoded credentials (in production, use proper authentication)
    const validCredentials = {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'snobol2025'
    }

    if (username === validCredentials.username && password === validCredentials.password) {
      // Create a simple session token (in production, use JWT or proper session management)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')
      
      const response = NextResponse.json(
        { success: true, token },
        { status: 200 }
      )

      // Set HTTP-only cookie
      response.cookies.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 hours
      })

      return response
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
