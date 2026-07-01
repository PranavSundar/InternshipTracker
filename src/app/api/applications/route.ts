import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get max sortOrder for the target status
    const maxOrder = await prisma.application.aggregate({
      _max: { sortOrder: true },
      where: { status: body.status || 'WISHLIST' },
    });

    const application = await prisma.application.create({
      data: {
        company: body.company,
        role: body.role,
        status: body.status || 'WISHLIST',
        dateApplied: body.dateApplied ? new Date(body.dateApplied) : null,
        deadline: body.deadline ? new Date(body.deadline) : null,
        jobLink: body.jobLink || null,
        location: body.location || null,
        notes: body.notes || null,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Failed to create application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}
