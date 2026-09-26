/**
 * Site-wide HTTP Basic Auth for ThinkArena.
 *
 * A Netlify Edge Function that runs for every request (`/*`). It checks the
 * `Authorization: Basic` header against credentials supplied through Netlify
 * environment variables, and prompts the browser's native login dialog when
 * they're missing or wrong.
 *
 * Required environment variables (Netlify UI → Site configuration → Environment
 * variables, or `netlify env:set`):
 *
 *   BASIC_AUTH_USER   username
 *   BASIC_AUTH_PASS   password
 *
 * The site fails CLOSED (503) if they aren't configured, so this never silently
 * exposes the app. Credentials are compared in constant time.
 */

const REALM = 'ThinkArena'
const CONFIG = {
  path: '/*',
} as const

type EdgeContext = { next: () => Promise<Response> }

/** Read an env var from either the Netlify or Deno runtime. */
function env(key: string): string | undefined {
  const g = globalThis as Record<string, any>
  if (g.Netlify?.env?.get) return g.Netlify.env.get(key)
  if (g.Deno?.env?.get) return g.Deno.env.get(key)
  return undefined
}

/** Length-independent, constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const ab = enc.encode(a)
  const bb = enc.encode(b)
  const len = Math.max(ab.length, bb.length)
  let diff = ab.length ^ bb.length
  for (let i = 0; i < len; i++) {
    diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0)
  }
  return diff === 0
}

function unauthorized(): Response {
  return new Response('Authentication required.\n', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'Cache-Control': 'no-store',
    },
  })
}

export default async function handler(
  request: Request,
  context: EdgeContext,
): Promise<Response> {
  const expectedUser = env('BASIC_AUTH_USER')
  const expectedPass = env('BASIC_AUTH_PASS')

  // Fail closed: misconfiguration must never expose the site.
  if (!expectedUser || !expectedPass) {
    return new Response(
      'Basic auth is not configured on this site. Set BASIC_AUTH_USER and BASIC_AUTH_PASS.\n',
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const header = request.headers.get('authorization') ?? ''
  const [scheme, encoded] = header.split(' ')
  if (!/^basic$/i.test(scheme ?? '') || !encoded) return unauthorized()

  let decoded: string
  try {
    // RFC 7617: credentials are base64 of UTF-8 bytes. `atob` yields a latin1
    // string, so re-decode as UTF-8 to support non-ASCII usernames/passwords.
    const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0))
    decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  } catch {
    return unauthorized()
  }

  const sep = decoded.indexOf(':')
  if (sep < 0) return unauthorized()

  const user = decoded.slice(0, sep)
  const pass = decoded.slice(sep + 1)

  if (!safeEqual(user, expectedUser) || !safeEqual(pass, expectedPass)) {
    return unauthorized()
  }

  return context.next()
}

export { CONFIG as config }
