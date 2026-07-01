import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Status } from '@prisma/client';

export async function PATCH(request: NextRequest) {
  try {
    const { items } = await request.json();

    // items: { id: string, status: string, sortOrder: number }[]
    const updates = items.map(
      (item: { id: string; status: string; sortOrder: number }) =>
        prisma.application.update({
          where: { id: item.id },
          data: { status: item.status as Status, sortOrder: item.sortOrder },
        })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reorder applications:', error);
    return NextResponse.json(
      { error: 'Failed to reorder' },
      { status: 500 }
    );
  }
}
