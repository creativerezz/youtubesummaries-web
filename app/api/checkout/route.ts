import { Checkout } from "@polar-sh/nextjs";
import { NextRequest, NextResponse } from "next/server";

// Wrap the handler to add products fallback logic
export async function GET(request: NextRequest) {
  try {
    // Validate access token exists
    if (!process.env.POLAR_ACCESS_TOKEN) {
      // In development, return a helpful message instead of error
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(
          { 
            error: "Configuration error",
            message: "POLAR_ACCESS_TOKEN environment variable is not configured",
            help: "To enable checkout, add POLAR_ACCESS_TOKEN to your .env.local file. See docs/POLAR_SETUP.md for setup instructions.",
            setup: {
              file: "apps/web/.env.local",
              variables: [
                "POLAR_ACCESS_TOKEN=polar_oat_your_token_here",
                "POLAR_SUCCESS_URL=http://localhost:3000/success?checkout_id={CHECKOUT_ID}",
                "POLAR_SERVER=sandbox",
                "POLAR_PRODUCT_ID=your_product_id_here"
              ]
            }
          },
          { status: 503 } // Service Unavailable - feature not configured
        );
      }
      
      // In production, return error
      return NextResponse.json(
        { 
          error: "Configuration error",
          message: "POLAR_ACCESS_TOKEN environment variable is not configured",
        },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const products = searchParams.get("products");

    // If no products in query, try to use default from environment variable
    if (!products) {
      if (process.env.POLAR_PRODUCT_ID) {
        // Redirect to the same URL with products parameter added
        const url = new URL(request.url);
        url.searchParams.set("products", process.env.POLAR_PRODUCT_ID);
        return NextResponse.redirect(url);
      }
      
      // If no default product ID, return helpful error
      return NextResponse.json(
        { 
          error: "Missing products in query params",
          message: "Please provide a products query parameter or set POLAR_PRODUCT_ID environment variable",
          example: "/api/checkout?products=prod_abc123"
        },
        { status: 400 }
      );
    }

    // Create the checkout handler with validated token
    let checkoutHandler;
    try {
      checkoutHandler = Checkout({
        accessToken: process.env.POLAR_ACCESS_TOKEN,
        successUrl: process.env.POLAR_SUCCESS_URL || "https://youtubesummaries.cc/success?checkout_id={CHECKOUT_ID}",
        server: process.env.POLAR_SERVER === "production" ? "production" : "sandbox",
      });
    } catch (initError) {
      console.error("Failed to create checkout handler:", initError);
      return NextResponse.json(
        {
          error: "Initialization error",
          message: initError instanceof Error ? initError.message : "Failed to initialize checkout handler",
        },
        { status: 500 }
      );
    }

    // Check if handler is a function
    if (typeof checkoutHandler !== 'function') {
      console.error('Checkout handler is not a function:', typeof checkoutHandler);
      return NextResponse.json(
        { 
          error: "Internal error",
          message: "Checkout handler is not a valid function",
        },
        { status: 500 }
      );
    }

    // Pass the request to the Polar Checkout handler
    // The handler is a Next.js route handler function
    try {
      return await checkoutHandler(request);
    } catch (handlerError) {
      console.error("Checkout handler error:", handlerError);
      throw handlerError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error("Checkout error:", error);

    const err = error as { response?: { status?: number }; message?: string };

    // Handle authentication errors
    if (err.response?.status === 401 || err.message?.includes("invalid_token") || err.message?.includes("expired")) {
      return NextResponse.json(
        {
          error: "Authentication error",
          message: "The Polar access token is invalid or expired. Please check your POLAR_ACCESS_TOKEN environment variable.",
        },
        { status: 401 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: "Checkout failed",
        message: err.message || "An error occurred while processing the checkout",
      },
      { status: 500 }
    );
  }
}