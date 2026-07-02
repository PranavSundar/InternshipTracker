import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put, del } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const applicationId = formData.get('applicationId') as string;

    if (!file || !applicationId) {
      return NextResponse.json(
        { error: 'File and applicationId are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be under 5MB' },
        { status: 400 }
      );
    }

    // Delete old resume if exists
    const existing = await prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (existing?.resumeUrl) {
      try {
        await del(existing.resumeUrl);
      } catch {
        // Ignore blob deletion errors
      }
    }

    // Upload to Vercel Blob
    const blob = await put(`resumes/${applicationId}/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Update application record
    const application = await prisma.application.update({
      where: { id: applicationId },
      data: {
        resumeUrl: blob.url,
        resumeName: file.name,
        resumeUploadedAt: new Date(),
      },
    });

    return NextResponse.json(application);
  } catch (error: any) {
    console.error('Failed to upload resume:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload resume' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json(
        { error: 'applicationId is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (existing?.resumeUrl) {
      try {
        await del(existing.resumeUrl);
      } catch {
        // Ignore blob deletion errors
      }
    }

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: {
        resumeUrl: null,
        resumeName: null,
        resumeUploadedAt: null,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error('Failed to delete resume:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
}
