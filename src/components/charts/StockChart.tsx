import { useMemo } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    ReferenceArea,
    ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { StockData } from "@/lib/stock";
import { getDayGanZhi, getMonthGanZhi, getYearGanZhi, getHourGanZhi, getElementColor } from "@/lib/ganzhi";
import { FIVE_ELEMENTS, ELEMENT_RELATIONS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface StockChartProps {
    data: StockData[];
    symbol: string;
    name: string;
    interval: string;
    onIntervalChange: (val: string) => void;
}

// Map interval to relevant GanZhi pillar
const INTERVAL_PILLAR_MAP: Record<string, "year" | "month" | "day" | "hour"> = {
    "1d": "day",
    "1wk": "month", // Weeks usually fall into months logic
    "1mo": "month",   // Actually for 1mo view, we want to see YEAR changes or MONTH changes?
    // If viewing 5 years of 1mo data -> YEAR changes are most visible.
    // If viewing 1 year of 1mo data -> MONTH changes.
    // Let's stick to: 1mo -> Year Pillar? Or Month Pillar?
    // User asked: "In Year/Hour chart... show Year/Hour GanZhi".
    // Let's default: 1mo -> Year Pillar (Macro), 1d -> Month/Day Pillar (Micro).
    // Actually, for "Yearly View", users usually stick to Monthly candles.
    // Let's make it dynamic or configurable? For now:
    // 1mo -> Year GanZhi
    // 1d -> Month GanZhi blocks + Day GanZhi tooltip
    // 60m -> Day GanZhi blocks + Hour GanZhi tooltip
    "60m": "day",
};

export function StockChart({ data, symbol, name, interval, onIntervalChange }: StockChartProps) {

    // Process data to add GanZhi info
    const { chartData, segments } = useMemo(() => {
        if (!data || data.length === 0) return { chartData: [], segments: [] };

        const processed = data.map((item) => {
            const date = new Date(item.date);
            const yearGZ = getYearGanZhi(date);
            const monthGZ = getMonthGanZhi(date, yearGZ.gan);
            const dayGZ = getDayGanZhi(date);
            // Hour GZ only relevant if we had hour data... but item.date is usually 00:00 for daily.
            // For 60m data, date includes time.
            const hourGZ = interval === "60m" ? getHourGanZhi(date, dayGZ.gan) : { gan: "", zhi: "" };

            return {
                ...item,
                yearGan: yearGZ.gan,
                yearZhi: yearGZ.zhi,
                monthGan: monthGZ.gan,
                monthZhi: monthGZ.zhi,
                dayGan: dayGZ.gan,
                dayZhi: dayGZ.zhi,
                hourGan: hourGZ.gan,
                hourZhi: hourGZ.zhi,
                // Format for axis
                shortDate: interval === "60m" ? format(date, "MM/dd HH:mm") : format(date, "MM/dd"),
                fullDate: date.getTime(),
            };
        });

        // Calculate Segmentation (colored blocks)
        // Rule:
        // 1mo -> Segment by YEAR
        // 1wk/1d -> Segment by MONTH
        // 60m -> Segment by DAY

        type Segment = {
            start: number; // timestamp
            end: number;   // timestamp
            label: string;
            element: string; // wood, fire etc. for color
        };

        const generatedSegments: Segment[] = [];
        let currentSegment: Segment | null = null;

        processed.forEach((item, index) => {
            let segmentKey = "";
            let segmentLabel = "";
            let segmentElementKey = "";

            if (interval === "1mo") {
                segmentKey = item.yearGan + item.yearZhi;
                segmentLabel = `${item.yearGan}${item.yearZhi}年`;
                segmentElementKey = item.yearGan; // Year Gan determines element color? Or Zhi? usually Gan.
            } else if (interval === "1d" || interval === "1wk") {
                segmentKey = item.monthGan + item.monthZhi;
                segmentLabel = `${item.monthGan}${item.monthZhi}月`;
                segmentElementKey = item.monthGan;
            } else if (interval === "60m") {
                segmentKey = item.dayGan + item.dayZhi;
                segmentLabel = `${item.dayGan}${item.dayZhi}日`;
                segmentElementKey = item.dayGan;
            }

            if (!currentSegment || currentSegment.label !== segmentLabel) {
                if (currentSegment) {
                    currentSegment.end = item.fullDate;
                    generatedSegments.push(currentSegment);
                }
                currentSegment = {
                    start: item.fullDate,
                    end: item.fullDate, // will update
                    label: segmentLabel,
                    element: FIVE_ELEMENTS[segmentElementKey as keyof typeof FIVE_ELEMENTS] || "wood",
                };
            } else {
                // extend current
                currentSegment.end = item.fullDate;
            }

            // Push last
            if (index === processed.length - 1 && currentSegment) {
                generatedSegments.push(currentSegment);
            }
        });

        return { chartData: processed, segments: generatedSegments };
    }, [data, interval]);

    // Element color map for background opacity areas
    const ELEMENT_BG_COLORS: Record<string, string> = {
        wood: "#10b981", // emerald-500
        fire: "#f43f5e", // rose-500
        earth: "#d97706", // amber-600
        metal: "#eab308", // yellow-500
        water: "#3b82f6", // blue-500
    };

    const ElementBadge = ({ char }: { char: string }) => {
        // @ts-ignore
        const elementKey = FIVE_ELEMENTS[char];
        // @ts-ignore
        const relation = ELEMENT_RELATIONS[elementKey];
        if (!relation) return <span>{char}</span>;

        let colorClass = "text-gray-500";
        if (relation.color === "emerald") colorClass = "text-emerald-600 dark:text-emerald-400";
        if (relation.color === "rose") colorClass = "text-rose-600 dark:text-rose-400";
        if (relation.color === "amber") colorClass = "text-amber-600 dark:text-amber-400"; // earth
        if (relation.color === "yellow") colorClass = "text-yellow-600 dark:text-yellow-400"; // metal
        if (relation.color === "blue") colorClass = "text-blue-600 dark:text-blue-400";

        return (
            <span className="font-mono">
                {char}
                <span className={`ml-1 text-[10px] ${colorClass}`}>
                    {relation.name}
                </span>
            </span>
        );
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            let dateStr = "";
            if (interval === "1mo") {
                dateStr = format(new Date(d.date), "yyyy年MM月");
            } else if (interval === "60m") {
                dateStr = format(new Date(d.date), "MM/dd HH:mm");
            } else {
                dateStr = format(new Date(d.date), "yyyy年MM月dd日");
            }

            return (
                <div className="rounded-lg border bg-background p-4 shadow-lg z-50">
                    <div className="mb-2 border-b pb-2">
                        <h4 className="font-semibold text-foreground">{dateStr}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-3">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs">Price</span>
                            <span className="font-mono font-bold text-lg">{d.close.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-muted-foreground text-xs">Change</span>
                            <span className={`font-mono font-bold ${d.close >= d.open ? 'text-green-500' : 'text-red-500'}`}>
                                {((d.close - d.open) / d.open * 100).toFixed(2)}%
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1 pt-1 border-t">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Year</span>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="flex gap-1">
                                    <ElementBadge char={d.yearGan} />
                                    <ElementBadge char={d.yearZhi} />
                                </Badge>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Month</span>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="flex gap-1">
                                    <ElementBadge char={d.monthGan} />
                                    <ElementBadge char={d.monthZhi} />
                                </Badge>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Day</span>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="flex gap-1">
                                    <ElementBadge char={d.dayGan} />
                                    <ElementBadge char={d.dayZhi} />
                                </Badge>
                            </div>
                        </div>
                        {interval === "60m" && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Hour</span>
                                <Badge variant="secondary" className="flex gap-1">
                                    <ElementBadge char={d.hourGan} />
                                    <ElementBadge char={d.hourZhi} />
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold">
                        {symbol} - {name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {interval === "1mo" ? "Yearly View (Month Candles)" :
                            interval === "1d" ? "Daily View" :
                                interval === "60m" ? "Hourly View" : "Chart"}
                    </p>
                </div>
                <Tabs value={interval} onValueChange={onIntervalChange} className="w-auto">
                    <TabsList>
                        <TabsTrigger value="1mo">Yearly</TabsTrigger>
                        <TabsTrigger value="1d">Daily</TabsTrigger>
                        <TabsTrigger value="60m">Hourly</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="h-[500px] w-full pt-4 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />

                        {/* GanZhi Background Segments */}
                        {segments.map((seg, i) => (
                            <g key={i}>
                                <ReferenceArea
                                    x1={seg.start}
                                    x2={seg.end}
                                    fill={ELEMENT_BG_COLORS[seg.element]}
                                    fillOpacity={0.15}
                                    label={{
                                        value: seg.label,
                                        position: 'insideTop',
                                        fill: ELEMENT_BG_COLORS[seg.element],
                                        fontSize: 12,
                                        fontWeight: 'bold',
                                        offset: 10
                                    }}
                                />
                                {/* Add separator line at the start of each segment (except the first one if it matches chart start) */}
                                {i > 0 && (
                                    <ReferenceLine
                                        x={seg.start}
                                        stroke="var(--foreground)"
                                        strokeOpacity={0.1}
                                        strokeDasharray="3 3"
                                    />
                                )}
                            </g>
                        ))}

                        <XAxis
                            dataKey="fullDate"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={(unix) => {
                                const d = new Date(unix);
                                if (interval === "1mo") return format(d, "yyyy/MM");
                                if (interval === "60m") return format(d, "MM/dd HH:mm");
                                return format(d, "MM/dd");
                            }}
                            className="text-xs text-muted-foreground"
                            tickMargin={10}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            className="text-xs text-muted-foreground"
                            tickFormatter={(val) => val.toFixed(0)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="close"
                            stroke="var(--color-primary)"
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
