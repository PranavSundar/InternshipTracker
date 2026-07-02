import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/blob';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return new NextResponse('Missing url parameter', { status: 400 });
    }

    // Fetch the private blob using the Vercel Blob SDK
    const result = await get(url, {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!result) {
      return new NextResponse('Blob not found', { status: 404 });
    }

    if (result.statusCode !== 200) {
      return new NextResponse('Failed to fetch blob', { status: result.statusCode });
    }

    // Pipe the PDF back to the client
    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType || 'application/pdf',
        'Content-Disposition': 'inline', // Opens in browser instead of forcing download
      },
    });
  } catch (error: any) {
    console.error('Failed to proxy resume download:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
