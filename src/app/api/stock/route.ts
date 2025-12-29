import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol");
    const interval = searchParams.get("interval") || "1d"; // 1d, 1wk, 1mo, 60m
    const range = searchParams.get("range") || "1y"; // Default to 1 year

    // Yahoo Finance API Logic
    const endDate = new Date();
    let startDate = new Date();

    // Adjust start date based on range or interval
    // For intra-day (60m), Yahoo limit is usually 730 days.
    if (interval.endsWith("m") || interval.endsWith("h")) {
        startDate.setDate(endDate.getDate() - 729); // Max 730 days
        // If user requested shorter range, respect it? 
        // For simplicity, let's keep logic simple: 
        // If range is provided, use it. If not, default to max for interval.
    }

    // Override based on specific range request if compatible
    if (range === '1mo') startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    else if (range === '3mo') startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    else if (range === '6mo') startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    else if (range === '1y') startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    else if (range === '2y') startDate = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000);
    else if (range === '5y') startDate = new Date(Date.now() - 1825 * 24 * 60 * 60 * 1000);
    else if (range === 'max') startDate = new Date("2000-01-01"); // Reasonable max
    else {
        // Default fallbacks
        if (interval === "1mo") startDate = new Date("2010-01-01"); // Long history for monthly
        else startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1y default
    }

    try {
        const result = await yahooFinance.historical(symbol!, {
            period1: startDate.toISOString().split('T')[0],
            period2: endDate.toISOString().split('T')[0],
            interval: interval as any,
        }) as Array<any>;

        // Transform result to match our frontend interface if needed, 
        // but yahoo-finance2 returns { date, open, high, low, close, volume } which matches nicely.
        // Just need to ensure date is string formatted.

        const formattedResult = result.map(item => ({
            date: item.date.toISOString().split('T')[0],
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume
        }));

        return NextResponse.json(formattedResult);
    } catch (error: any) {
        console.error("Yahoo Finance API Error for symbol:", symbol, "interval:", interval);
        if (error.errors) {
            console.error("Validation Errors:", JSON.stringify(error.errors, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }

        return NextResponse.json(
            { error: "Failed to fetch stock data", details: error.message },
            { status: 500 }
        );
    }
}
