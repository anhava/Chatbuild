import Stripe from 'stripe';
import { config } from './config';
import { prisma } from './prisma';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

export interface CreateCheckoutSessionParams {
  userId: string;
  planType: 'PRO' | 'PREMIUM' | 'ENTERPRISE';
  successUrl: string;
  cancelUrl: string;
}

export interface CreatePortalSessionParams {
  userId: string;
  returnUrl: string;
}

export class StripeService {
  /**
   * Create a Stripe Checkout session for subscription
   */
  static async createCheckoutSession({
    userId,
    planType,
    successUrl,
    cancelUrl,
  }: CreateCheckoutSessionParams) {
    try {
      // Get or create Stripe customer
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      let stripeCustomerId = user.subscription?.stripeSubscriptionId;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId,
          },
        });
        stripeCustomerId = customer.id;
      }

      // Get price ID based on plan type
      const priceId = await getPriceIdForPlan(planType);

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          planType,
        },
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Create a Stripe Customer Portal session
   */
  static async createPortalSession({
    userId,
    returnUrl,
  }: CreatePortalSessionParams) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user?.subscription?.stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.subscription.stripeSubscriptionId,
        return_url: returnUrl,
      });

      return session;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhookEvent(
    event: Stripe.Event
  ): Promise<{ status: number; message: string }> {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionChange(subscription);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionDeletion(subscription);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          await handleFailedPayment(invoice);
          break;
        }
      }

      return { status: 200, message: 'Webhook handled successfully' };
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }
}

// Helper functions

async function getPriceIdForPlan(planType: string): Promise<string> {
  // In production, these would be stored in the database or environment variables
  const priceIds = {
    PRO: 'price_pro',
    PREMIUM: 'price_premium',
    ENTERPRISE: 'price_enterprise',
  };

  const priceId = priceIds[planType as keyof typeof priceIds];
  if (!priceId) {
    throw new Error('Invalid plan type');
  }

  return priceId;
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) {
    throw new Error('No user ID in subscription metadata');
  }

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      planType: subscription.metadata.planType as any,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
    update: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  // Update user's plan type
  await prisma.user.update({
    where: { id: userId },
    data: {
      planType: subscription.metadata.planType as any,
    },
  });
}

async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) {
    throw new Error('No user ID in subscription metadata');
  }

  // Update subscription status
  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'canceled',
    },
  });

  // Revert user to free plan
  await prisma.user.update({
    where: { id: userId },
    data: {
      planType: 'FREE',
    },
  });
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  );

  const userId = subscription.metadata.userId;
  if (!userId) {
    throw new Error('No user ID in subscription metadata');
  }

  // Update subscription status
  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'past_due',
    },
  });

  // You might want to notify the user here
}

export default StripeService;
