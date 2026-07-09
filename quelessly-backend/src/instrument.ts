import * as Sentry from '@sentry/node'

const SENSITIVE_KEYS = ['razorpay_key_secret', 'razorpay_key_id', 'password', 'newPassword', 'otp', 'token']

const scrub = (obj: unknown): void => {
  if (!obj || typeof obj !== 'object') return
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    const record = obj as Record<string, unknown>
    if (SENSITIVE_KEYS.includes(key)) {
      record[key] = '[redacted]'
    } else if (typeof record[key] === 'object') {
      scrub(record[key])
    }
  }
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'production',
  tracesSampleRate: 0,
  sendDefaultPii: false,
  beforeSend(event) {
    // Defense in depth: never let vendor keys / passwords reach Sentry,
    // even if request-data capture is ever enabled.
    if (event.request?.data) scrub(event.request.data)
    if (event.extra) scrub(event.extra)
    return event
  },
})