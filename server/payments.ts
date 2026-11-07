import Stripe from 'stripe'

type PaymentProvider = 'stripe' | 'mock'

function getProvider(): PaymentProvider {
  const key = process.env.STRIPE_SECRET_KEY
  if (key && key.startsWith('sk_')) return 'stripe'
  return 'mock'
}

export interface PaymentRequest {
  bookingId: number
  reference: string
  amountK: number
  currency: string
  description: string
  customerEmail: string
  customerName: string
  successUrl: string
  cancelUrl: string
}

export interface PaymentResult {
  provider: PaymentProvider
  status: 'paid' | 'pending' | 'failed'
  transactionId: string | null
  message: string
  checkoutUrl?: string
}

const provider = getProvider()
const stripe = provider === 'stripe'
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-09-30.accent' as Stripe.StripeConfig['apiVersion'] })
  : null

export function getPaymentProvider(): PaymentProvider {
  return provider
}

export function getStripePublishableKey(): string {
  return process.env.STRIPE_PUBLIC_KEY || ''
}

export async function createPaymentSession(req: PaymentRequest): Promise<PaymentResult> {
  if (provider === 'stripe' && stripe) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: req.customerEmail,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: req.currency.toLowerCase(),
              product_data: { name: req.description },
              unit_amount: Math.round(req.amountK * 100),
            },
          },
        ],
        metadata: {
          bookingId: String(req.bookingId),
          reference: req.reference,
        },
        success_url: req.successUrl,
        cancel_url: req.cancelUrl,
      })
      return {
        provider: 'stripe',
        status: 'pending',
        transactionId: session.id,
        message: 'Redirect to Stripe to complete payment.',
        checkoutUrl: session.url || undefined,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Stripe error'
      return { provider: 'stripe', status: 'failed', transactionId: null, message }
    }
  }

  // Mock provider — simulates an instant successful payment locally.
  const txId = `MOCK-${Date.now().toString(36).toUpperCase()}`
  return {
    provider: 'mock',
    status: 'paid',
    transactionId: txId,
    message: 'Payment simulated locally (mock provider).',
  }
}

export function verifyWebhookSignature(payload: string, signature: string): { ok: boolean; event?: Stripe.Event; error?: string } {
  if (provider !== 'stripe' || !stripe) {
    return { ok: false, error: 'Stripe is not configured.' }
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return { ok: false, error: 'STRIPE_WEBHOOK_SECRET is not set.' }
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret)
    return { ok: true, event }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Signature verification failed'
    return { ok: false, error: message }
  }
}