import { NextResponse } from 'next/server';
import { safeHref } from '@/lib/safe';

export function GET(request: Request) {
  const configured = safeHref(process.env.NEXT_PUBLIC_CLIPSY_DASHBOARD_URL);
  if (!configured) return NextResponse.redirect(new URL('/contact?topic=dashboard', request.url));
  return NextResponse.redirect(configured, 307);
}
