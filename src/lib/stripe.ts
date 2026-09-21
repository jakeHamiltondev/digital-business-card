import Stripe from 'stripe'

let _instance: Stripe | null = null

function getInstance(): Stripe {
  if (!_instance) {
    _instance = new Stripe(process.env.STRIPE_SECRET_KEY!)
  }
  return _instance
}

// Lazy proxy — defers new Stripe() until the first request so build-time
// evaluation (which has no STRIPE_SECRET_KEY) doesn't throw.
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    const s = getInstance()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = (s as any)[prop]
    return typeof val === 'function' ? val.bind(s) : val
  },
})
