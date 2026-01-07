#!/usr/bin/env tsx
/**
 * Script to create a Polar.sh product for YouTube Summaries Pro subscription
 * 
 * Usage:
 *   tsx scripts/create-polar-product.ts
 * 
 * Environment variables required:
 *   POLAR_ACCESS_TOKEN - Your Polar.sh API access token
 */

import { Polar } from '@polar-sh/sdk';

// Load environment variables from .env.local
// Note: dotenv is not needed - environment variables are loaded by the runtime

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: process.env.POLAR_SERVER === 'production' ? 'production' : 'sandbox', // Default to sandbox
});

async function createProProduct() {
  if (!process.env.POLAR_ACCESS_TOKEN) {
    console.error('❌ POLAR_ACCESS_TOKEN environment variable is required');
    process.exit(1);
  }

  try {
    console.log('🚀 Creating Pro subscription product...');
    console.log(`📦 Environment: ${process.env.POLAR_SERVER === 'production' ? 'production' : 'sandbox'}`);

    // Create a recurring subscription product
    const product = await polar.products.create({
      name: 'YouTube Summaries Pro',
      description: 'Pro subscription for YouTube Summaries - Get 100 credits per month, unlimited video summaries, and priority support.',
      isRecurring: true, // This is a subscription product
      prices: [
        {
          amountType: 'fixed',
          priceAmount: 999, // $9.99 per month in cents
          priceCurrency: 'usd',
          recurringInterval: 'month', // Monthly subscription
        },
      ],
      // Optional: Add metadata
      metadata: {
        tier: 'pro',
        credits: '100',
        features: 'unlimited_summaries,priority_support',
      },
    });

    console.log('\n✅ Product created successfully!');
    console.log('\n📋 Product Details:');
    console.log(`   ID: ${product.id}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   Type: ${product.isRecurring ? 'Recurring Subscription' : 'One-time'}`);
    console.log(`   Price: $${(product.prices[0]?.priceAmount || 0) / 100} ${product.prices[0]?.priceCurrency?.toUpperCase()}`);
    console.log(`   Interval: ${product.prices[0]?.recurringInterval || 'N/A'}`);

    console.log('\n🔧 Next steps:');
    console.log(`   1. Add this to your .env.local file:`);
    console.log(`      POLAR_PRODUCT_ID=${product.id}`);
    console.log(`   2. Update your checkout links to use: /api/checkout?products=${product.id}`);
    console.log(`   3. Test the checkout flow in ${process.env.POLAR_SERVER === 'production' ? 'production' : 'sandbox'} mode`);

    return product;
  } catch (error) {
    console.error('\n❌ Error creating product:');
    const err = error as { response?: { status?: number; data?: { detail?: string } }; message?: string };
    if (err.response) {
      console.error(`   Status: ${err.response.status}`);
      console.error(`   Message: ${err.response.data?.detail || err.message}`);
    } else {
      console.error(`   ${err.message}`);
    }
    process.exit(1);
  }
}

// Run the script
createProProduct()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
