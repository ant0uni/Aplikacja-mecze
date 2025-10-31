import { NextRequest, NextResponse } from "next/server";

// Server-side proxy to bypass CORS
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint parameter is required' },
        { status: 400 }
      );
    }

    const baseUrl = 'https://www.sofascore.com/api/v1';
    const targetUrl = `${baseUrl}${endpoint}`;

    console.log('Proxying request to:', targetUrl);

    // Make server-side request with spoofed headers
    const response = await fetch(targetUrl, {
      headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Host': 'www.sofascore.com',
        'Origin': 'https://www.sofascore.com',
        'Referer': 'https://www.sofascore.com/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        // These headers make it look like localhost/same-origin
        'X-Forwarded-For': '127.0.0.1',
        'X-Forwarded-Host': 'www.sofascore.com',
        'X-Forwarded-Proto': 'https',
        'X-Real-IP': '127.0.0.1',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SofaScore API error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch from SofaScore',
          status: response.status,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return data with CORS headers enabled for our frontend
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      },
    });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal proxy error', message: error.message },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
