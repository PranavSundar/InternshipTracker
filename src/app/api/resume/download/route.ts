import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return new NextResponse('Missing url parameter', { status: 400 });
    }

    // Fetch the private blob using the Vercel Blob token
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch blob from storage', { status: response.status });
    }

    // Pipe the PDF back to the client
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline', // Opens in browser instead of forcing download
      },
    });
  } catch (error) {
    console.error('Failed to proxy resume download:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
