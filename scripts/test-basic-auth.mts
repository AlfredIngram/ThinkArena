// Local smoke test for netlify/edge-functions/basic-auth.ts logic.
// Run: node --experimental-strip-types scripts/test-basic-auth.mts
import handler from '../netlify/edge-functions/basic-auth.ts'

type Env = Record<string, string | undefined>

function setEnv(env: Env) {
  ;(globalThis as any).Netlify = { env: { get: (k: string) => env[k] } }
}

const NEXT = new Response('<html>app</html>', { status: 200 })
const context = { next: async () => NEXT }

function req(auth?: string) {
  const headers: Record<string, string> = {}
  if (auth !== undefined) headers.authorization = auth
  return new Request('https://example.com/verse', { headers })
}

const b64 = (s: string) => Buffer.from(s, 'utf8').toString('base64')

let failures = 0
function check(name: string, cond: boolean, detail?: unknown) {
  if (cond) {
    console.log(`  ok   ${name}`)
  } else {
    failures++
    console.log(`  FAIL ${name}`, detail ?? '')
  }
}

async function run() {
  // 1. Unconfigured -> fail closed
  setEnv({})
  let r = await handler(req(), context)
  check('unconfigured -> 503', r.status === 503, r.status)

  // 2. No credentials -> 401 with challenge
  setEnv({ BASIC_AUTH_USER: 'tony', BASIC_AUTH_PASS: 's3cret' })
  r = await handler(req(), context)
  check('missing header -> 401', r.status === 401, r.status)
  check(
    'challenge header present',
    (r.headers.get('www-authenticate') ?? '').startsWith('Basic realm="ThinkArena"'),
    r.headers.get('www-authenticate'),
  )

  // 3. Wrong password -> 401
  r = await handler(req(`Basic ${b64('tony:nope')}`), context)
  check('wrong password -> 401', r.status === 401, r.status)

  // 4. Wrong username -> 401
  r = await handler(req(`Basic ${b64('nope:s3cret')}`), context)
  check('wrong username -> 401', r.status === 401, r.status)

  // 5. Correct -> passes through
  r = await handler(req(`Basic ${b64('tony:s3cret')}`), context)
  check('correct creds -> 200 pass-through', r.status === 200, r.status)

  // 6. Password containing a colon still works
  setEnv({ BASIC_AUTH_USER: 'tony', BASIC_AUTH_PASS: 'a:b:c' })
  r = await handler(req(`Basic ${b64('tony:a:b:c')}`), context)
  check('password with colons -> 200', r.status === 200, r.status)

  // 7. Non-basic scheme -> 401
  r = await handler(req('Bearer abcdef'), context)
  check('bearer scheme -> 401', r.status === 401, r.status)

  // 8. Garbage base64 -> 401 (no throw)
  r = await handler(req('Basic !!!not-base64!!!'), context)
  check('garbage base64 -> 401', r.status === 401, r.status)

  // 9. Prefix of the password must NOT pass (length-aware compare)
  setEnv({ BASIC_AUTH_USER: 'tony', BASIC_AUTH_PASS: 's3cret' })
  r = await handler(req(`Basic ${b64('tony:s3cre')}`), context)
  check('password prefix -> 401', r.status === 401, r.status)

  // 10. UTF-8 credentials round-trip
  setEnv({ BASIC_AUTH_USER: 'usér', BASIC_AUTH_PASS: 'pä$$' })
  r = await handler(req(`Basic ${b64('usér:pä$$')}`), context)
  check('utf-8 creds -> 200', r.status === 200, r.status)

  console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`)
  process.exit(failures === 0 ? 0 : 1)
}

run()
