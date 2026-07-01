import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(application);
  } catch (error) {
    console.error('Failed to fetch application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.company !== undefined) updateData.company = body.company;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.dateApplied !== undefined)
      updateData.dateApplied = body.dateApplied ? new Date(body.dateApplied) : null;
    if (body.deadline !== undefined)
      updateData.deadline = body.deadline ? new Date(body.deadline) : null;
    if (body.jobLink !== undefined) updateData.jobLink = body.jobLink || null;
    if (body.location !== undefined) updateData.location = body.location || null;
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
    if (body.resumeUrl !== undefined) updateData.resumeUrl = body.resumeUrl;
    if (body.resumeName !== undefined) updateData.resumeName = body.resumeName;
    if (body.resumeUploadedAt !== undefined)
      updateData.resumeUploadedAt = body.resumeUploadedAt
        ? new Date(body.resumeUploadedAt)
        : null;

    const application = await prisma.application.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error('Failed to update application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete resume from blob storage if exists
    const existing = await prisma.application.findUnique({ where: { id } });
    if (existing?.resumeUrl) {
      try {
        await del(existing.resumeUrl);
      } catch {
        // Ignore blob deletion errors
      }
    }

    await prisma.application.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
