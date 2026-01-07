#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Script to create a Polar.sh product for YouTube Summaries Pro subscription
 *
 * Usage:
 *   node scripts/create-polar-product.js              # Sandbox mode (default)
 *   node scripts/create-polar-product.js --production # Production mode
 *   node scripts/create-polar-product.js -p            # Production mode (short)
 *
 * Environment variables required:
 *   POLAR_ACCESS_TOKEN - Your Polar.sh API access token
 *   POLAR_SERVER - Optional: 'production' or 'sandbox' (default: 'sandbox')
 */

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  try {
    const envFile = fs.readFileSync(filePath, 'utf8');
    const lines = envFile.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        // Remove inline comments (everything after # that's not in quotes)
        const commentIndex = trimmedLine.indexOf(' #');
        const lineWithoutComment = commentIndex > 0 ? trimmedLine.substring(0, commentIndex) : trimmedLine;
        
        const [key, ...valueParts] = lineWithoutComment.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
          value = value.trim(); // Remove any trailing whitespace
          process.env[key.trim()] = value;
        }
      }
    }
  } catch {
    // File doesn't exist or can't be read, that's okay
  }
}

// Try to load environment files from project root
const projectRoot = path.resolve(__dirname, '..');
// Check if production mode is requested via command line argument
const isProduction = process.argv.includes('--production') || process.argv.includes('-p');
if (isProduction) {
  loadEnvFile(path.join(projectRoot, '.env.production'));
  console.log('📦 Loading production environment...');
} else {
  loadEnvFile(path.join(projectRoot, '.env.local'));
  loadEnvFile(path.join(projectRoot, '.env')); // Also try .env as fallback
}

const { Polar } = require('@polar-sh/sdk');

// Determine server mode: command line arg > env var > default to sandbox
const serverMode = isProduction 
  ? 'production' 
  : (process.env.POLAR_SERVER === 'production' ? 'production' : 'sandbox');

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: serverMode,
});

async function createProProduct() {
  if (!process.env.POLAR_ACCESS_TOKEN) {
    console.error('❌ POLAR_ACCESS_TOKEN environment variable is required');
    console.error('   Please add it to your .env.local file');
    process.exit(1);
  }

  try {
    console.log('🚀 Creating Pro subscription product...');
    console.log(`📦 Environment: ${serverMode}`);
    if (serverMode === 'production') {
      console.log('⚠️  WARNING: Creating product in PRODUCTION mode!');
    }

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
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.detail || error.message}`);
    } else {
      console.error(`   ${error.message}`);
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
