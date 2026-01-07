# Scripts

Utility scripts for managing the YouTube Summaries application.

## Create Polar.sh Product

Creates a Pro subscription product in Polar.sh for the checkout flow.

### Prerequisites

1. **Polar.sh Account**: You need a Polar.sh account with API access
2. **Access Token**: Get your access token from [Polar.sh Settings](https://polar.sh/settings)
3. **Environment Variables**: Add to `.env.local`:
   ```env
   POLAR_ACCESS_TOKEN=your_access_token_here
   POLAR_SERVER=sandbox  # or 'production' for live
   ```

### Usage

```bash
# Using Node.js (recommended)
node scripts/create-polar-product.js

# Or using TypeScript (if tsx is installed)
npx tsx scripts/create-polar-product.ts
```

### What it creates

- **Product Name**: YouTube Summaries Pro
- **Type**: Recurring monthly subscription
- **Price**: $9.99/month
- **Description**: Pro subscription with 100 credits per month

### After running

The script will output:
1. The product ID
2. Instructions to add it to your `.env.local` file
3. How to use it in checkout links

### Example Output

```
✅ Product created successfully!

📋 Product Details:
   ID: prod_abc123xyz
   Name: YouTube Summaries Pro
   Type: Recurring Subscription
   Price: $9.99 USD
   Interval: month

🔧 Next steps:
   1. Add this to your .env.local file:
      POLAR_PRODUCT_ID=prod_abc123xyz
   2. Update your checkout links to use: /api/checkout?products=prod_abc123xyz
   3. Test the checkout flow in sandbox mode
```

### Customization

You can edit the script to change:
- Product name and description
- Price amount (in cents, e.g., 999 = $9.99)
- Currency
- Recurring interval (month, year, etc.)
- Metadata fields

### Troubleshooting

**Error: POLAR_ACCESS_TOKEN environment variable is required**
- Make sure you have a `.env.local` file in the project root
- Add `POLAR_ACCESS_TOKEN=your_token_here` to the file

**Error: Unauthorized**
- Check that your access token is valid
- Ensure you have permission to create products in your Polar.sh account

**Error: Invalid server**
- Make sure `POLAR_SERVER` is set to either `sandbox` or `production`
