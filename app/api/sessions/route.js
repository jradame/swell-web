import { auth, createClerkClient } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

async function getUserId(req) {
  // Try standard Clerk session (web app)
  try {
    const { userId } = await auth()
    if (userId) return userId
  } catch {}

  // Try Bearer token (native app)
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
      const payload = await clerkClient.verifyToken(token)
      if (payload?.sub) return payload.sub
    } catch {}
  }

  return null
}

export async function GET(req) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessions = await db.session.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(sessions)
}

export async function POST(req) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { spot, date, waveHeight, duration, board, rating, notes } = body

  if (!spot || !date || !waveHeight || !duration) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const session = await db.session.create({
    data: { userId, spot, date, waveHeight, duration, board: board || null, rating: rating || 0, notes: notes || null },
  })

  return NextResponse.json(session, { status: 201 })
}