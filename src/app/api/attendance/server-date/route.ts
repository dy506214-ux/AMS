import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Returns server's current local date in YYYY-MM-DD format
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const serverDate = `${year}-${month}-${day}`;
  
  return NextResponse.json({ serverDate });
}
