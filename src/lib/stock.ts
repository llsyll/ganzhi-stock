import { ElementType } from "./constants";

export interface StockData {
    date: string; // ISO Date string YYYY-MM-DD
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface StockInfo {
    symbol: string;
    name: string;
    sector: string;
    element: ElementType;
}

export const SECTOR_ELEMENT_MAP: Record<string, ElementType> = {
    "Technology": "fire",      // Information, Light, Electronics
    "Finance": "metal",        // Money, Gold
    "Real Estate": "earth",    // Land, Buildings
    "Energy": "fire",          // Power, Fuel
    "Healthcare": "wood",      // Growth, Herbs, Life
    "Utilities": "water",      // Flow, Grid
    "Consumer Discretionary": "wood", // Fashion, Textiles
    "Industrials": "metal",    // Machinery
    "Materials": "earth",      // Raw materials, Mining
    "Communication Services": "water", // Transmission, Flow
};

export const MOCK_STOCKS: StockInfo[] = [
    // Fire (火) - Tech, Energy, Optics
    { symbol: "NVDA", name: "英伟达 (AI/Chip)", sector: "科技 (火)", element: "fire" },
    { symbol: "AAPL", name: "苹果 (Consumer)", sector: "科技 (火)", element: "fire" },
    { symbol: "TSLA", name: "特斯拉 (EV)", sector: "汽车 (火)", element: "fire" },
    { symbol: "XOM", name: "埃克森美孚", sector: "能源 (火)", element: "fire" },

    // Metal (金) - Finance, Gold, Auto
    { symbol: "GLD", name: "SPDR黄金ETF", sector: "贵金属 (金)", element: "metal" },
    { symbol: "GC=F", name: "黄金期货", sector: "大宗商品 (金)", element: "metal" },
    { symbol: "JPM", name: "摩根大通", sector: "金融 (金)", element: "metal" },
    { symbol: "BABA", name: "阿里巴巴", sector: "电商 (金/水)", element: "metal" }, // Often debated, Commerce can be Metal (Exchange) or Water (Flow)

    // Water (水) - Logistics, Beverage, Transport
    { symbol: "600519.SS", name: "贵州茅台", sector: "酒类 (水)", element: "water" },
    { symbol: "KO", name: "可口可乐", sector: "饮料 (水)", element: "water" },
    { symbol: "ZIM", name: "以星航运", sector: "海运 (水)", element: "water" },
    { symbol: "0700.HK", name: "腾讯控股", sector: "社交 (水)", element: "water" },

    // Wood (木) - Healthcare, Forestry, Textiles
    { symbol: "WOOD", name: "全球林业ETF", sector: "林业 (木)", element: "wood" },
    { symbol: "LVMH.PA", name: "LVMH集团", sector: "时尚 (木)", element: "wood" },
    { symbol: "UNH", name: "联合健康", sector: "医疗 (木)", element: "wood" },

    // Earth (土) - Real Estate, Mining
    { symbol: "VNQ", name: "房地产信托ETF", sector: "地产 (土)", element: "earth" },
    { symbol: "RIO", name: "力拓矿业", sector: "矿业 (土)", element: "earth" },
    { symbol: "SSE", name: "上证指数", sector: "大盘 (土)", element: "earth" }, // Index often seen as Earth (Foundation)
];

export async function fetchStockData(symbol: string, range: string = "1y", interval: string = "1d"): Promise<StockData[]> {
    const response = await fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}&range=${range}&interval=${interval}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch stock data for ${symbol}`);
    }
    return response.json();
}
