"use client";

import { useEffect, useState } from "react";
import { StockChart } from "@/components/charts/StockChart";
import { fetchStockData, MOCK_STOCKS, StockData } from "@/lib/stock";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCcw, Loader2 } from "lucide-react";
import { getDayGanZhi, determineFortune } from "@/lib/ganzhi";
import { FIVE_ELEMENTS, ElementType } from "@/lib/constants";

// Helper for element color (can be moved to lib later)
const ELEMENT_COLORS: Record<string, string> = {
  wood: "text-emerald-500 border-emerald-500",
  fire: "text-rose-500 border-rose-500",
  earth: "text-amber-500 border-amber-500",
  metal: "text-yellow-500 border-yellow-500",
  water: "text-blue-500 border-blue-500",
};

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [searchInput, setSearchInput] = useState("");
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [interval, setInterval] = useState("1d"); // 1d, 1mo, 60m
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Determine current stock info. If not in mock list, create a fallback.
  const currentStock = MOCK_STOCKS.find((s) => s.symbol === selectedSymbol) || {
    symbol: selectedSymbol,
    name: selectedSymbol,
    sector: "Custom Search",
    element: "metal" as ElementType, // Default fallback
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSelectedSymbol(searchInput.trim().toUpperCase());
      setSearchInput("");
    }
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        // Adjust range based on interval?
        // 1mo -> 5y
        // 1d -> 1y
        // 60m -> 730d (api handles max)
        let range = "1y";
        if (interval === "1mo") range = "5y";
        if (interval === "1mo") range = "5y";
        if (interval === "60m") range = "730d"; // Try explicit days, closer to limit. 
        // Actually, reducing to 6mo is safer for reliability.
        if (interval === "60m") range = "1y"; // Let's try 1y.

        const data = await fetchStockData(selectedSymbol, range, interval);
        setStockData(data);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedSymbol, interval, refreshKey]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header / Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-foreground">天干地支市场分析</h1>
            <p className="text-muted-foreground">探索股市背后的五行能量</p>
          </div>

          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                placeholder="输入代码 (e.g. MSFT)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-[180px]"
              />
              <Button type="submit" size="icon" variant="ghost">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <Select value={selectedSymbol} onValueChange={setSelectedSymbol} disabled={isLoading}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="精选股票" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_STOCKS.map((stock) => (
                  <SelectItem key={stock.symbol} value={stock.symbol}>
                    {stock.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setRefreshKey(k => k + 1)} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Stock Info Card */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="col-span-1 space-y-4">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="font-semibold text-lg">{currentStock.name}</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">板块</span>
                  <span>{currentStock.sector}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">五行属性</span>
                  <Badge variant="outline" className={ELEMENT_COLORS[currentStock.element]}>
                    {currentStock.element === 'fire' ? '火' :
                      currentStock.element === 'water' ? '水' :
                        currentStock.element === 'wood' ? '木' :
                          currentStock.element === 'metal' ? '金' : '土'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h4 className="font-medium mb-4 text-sm text-muted-foreground">Today's Energy ({new Date().toLocaleDateString()})</h4>

              {(() => {
                const today = new Date();
                const todayGZ = getDayGanZhi(today);

                const fortune = determineFortune(currentStock.element, todayGZ.gan, todayGZ.zhi);
                const isLucky = fortune === "吉";

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Day Pillar</span>
                      <span className="font-mono font-medium">{todayGZ.gan}{todayGZ.zhi} ({FIVE_ELEMENTS[todayGZ.gan as keyof typeof FIVE_ELEMENTS]}/{FIVE_ELEMENTS[todayGZ.zhi as keyof typeof FIVE_ELEMENTS]})</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Fortune</span>
                      <Badge variant={isLucky ? "default" : "destructive"} className="text-base px-3 py-1">
                        {fortune}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                      Stock Element ({currentStock.element}) {isLucky ? "is supported by" : "clashes with"} today's energy.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="col-span-1 md:col-span-3">
            {error ? (
              <div className="flex h-[500px] w-full items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                {error}
              </div>
            ) : (
              <StockChart
                data={stockData}
                symbol={currentStock.symbol}
                name={currentStock.name}
                interval={interval}
                onIntervalChange={setInterval}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
