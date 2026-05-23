import { NextRequest, NextResponse } from 'next/server';
import type { CreateDiaryRequest } from '@/types';

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') ?? '1';
  const limit = searchParams.get('limit') ?? '10';

  const res = await fetch(`${FASTAPI_BASE_URL}/diary?page=${page}&limit=${limit}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch diaries' }, { status: res.status });
  }

  return NextResponse.json(await res.json());
}

export async function POST(req: NextRequest) {
  const body: CreateDiaryRequest = await req.json();

  if (!body.content?.trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  const res = await fetch(`${FASTAPI_BASE_URL}/diary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to save diary' }, { status: res.status });
  }

  return NextResponse.json(await res.json(), { status: 201 });
}
