import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sessions = await db.session.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(sessions)
}

export async function POST(req) {
  const { userId } = await auth()
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
