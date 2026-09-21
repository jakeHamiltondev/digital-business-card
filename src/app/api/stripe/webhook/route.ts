import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return Response.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const subscriptionId = session.subscription as string
      if (userId && subscriptionId) {
        await supabase
          .from('profiles')
          .update({ plan: 'pro', subscription_id: subscriptionId })
          .eq('id', userId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      // In Stripe SDK v22, current_period_end is on each subscription item
      const firstItem = subscription.items.data[0]
      if (firstItem) {
        const endDate = new Date(firstItem.current_period_end * 1000).toISOString()
        await supabase
          .from('profiles')
          .update({ subscription_end_date: endDate })
          .eq('stripe_customer_id', customerId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      await supabase
        .from('profiles')
        .update({ plan: 'free', subscription_id: null, subscription_end_date: null })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'invoice.payment_failed': {
      // Placeholder: add notification logic here when needed
      break
    }
  }

  return Response.json({ received: true })
}
