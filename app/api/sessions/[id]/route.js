import { auth, createClerkClient } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

async function getUserId(req) {
  try {
    const { userId } = await auth()
    if (userId) return userId
  } catch {}

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

export async function PUT(req, { params }) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await db.session.findUnique({ where: { id: params.id } })
  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()
  const { spot, date, waveHeight, duration, board, rating, notes } = body

  if (!spot || !date || !waveHeight || !duration) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const updated = await db.session.update({
    where: { id: params.id },
    data: { spot, date, waveHeight, duration, board: board || null, rating: rating || 0, notes: notes || null },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req, { params }) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await db.session.findUnique({ where: { id: params.id } })

  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.session.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
