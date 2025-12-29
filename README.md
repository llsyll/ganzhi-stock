# 天干地支股票查看 (GanZhi Stock Analyzer)

An intuitive stock market analyzer that combines traditional Chinese "GanZhi" (Heavenly Stems and Earthly Branches) and Five Elements theory with modern financial data.

## Features

- **Live Stock Data**: Fetches real-time/historical data via Yahoo Finance.
- **GanZhi Analysis**: Automatically calculates the Year/Month/Day/Hour pillars for any given time.
- **Five Elements Visualization**: Visualizes the elemental energy (Wood, Fire, Earth, Metal, Water) of time periods directly on the chart.
- **Fortune Indicator**: Simple algorithm to determine if the stock's element matches the current day's energy.
- **Stock Search**: Search for any global stock symbol (e.g., NVDA, AAPL, 600519.SS).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

### Recommended: Vercel (Supports API Routes)

This project uses Next.js API Routes (`/api/stock`) to proxy requests to Yahoo Finance. **Vercel** is the recommended platform as it natively supports these serverless functions.

1.  Push this code to a GitHub repository.
2.  Go to [Vercel](https://vercel.com) and import your GitHub repository.
3.  Click **Deploy**.

### GitHub Pages (Static Only - NOT Recommended)

**GitHub Pages** only supports static websites. Since this application requires a server-side API route to fetch stock data (to avoid CORS issues), **it will not work properly on GitHub Pages** unless you rewrite the data fetching logic to use a different, CORS-friendly public API.

## Tech Stack

-   **Framework**: Next.js 14 (App Router)
-   **UI**: Tailwind CSS, Shadcn/UI
-   **Charts**: Recharts
-   **Data**: Yahoo Finance 2
