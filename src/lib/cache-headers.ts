import { NextResponse } from 'next/server'

/**
 * JSON response cached on the Vercel CDN so repeat visitors don't invoke
 * a serverless function (and the database) on every request.
 * Browser always revalidates (max-age=0); CDN serves for `sMaxAge` seconds
 * and serves stale while refreshing in the background.
 */
export function cachedJson<T>(data: T, sMaxAge = 60, init?: { status?: number }) {
  return NextResponse.json(data, {
    status: init?.status,
    headers: {
      'Cache-Control': `public, max-age=0, s-maxage=${sMaxAge}, stale-while-revalidate=${sMaxAge * 5}`,
    },
  })
}
