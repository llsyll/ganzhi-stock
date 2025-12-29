import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <span className="text-xl font-bold tracking-tight">天干地支股票查看</span>
                </Link>
                <nav className="flex items-center space-x-6 text-sm font-medium">
                    <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        Chart
                    </Link>
                    <Link href="/analysis" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        Analysis
                    </Link>
                </nav>
                <div className="ml-auto flex items-center space-x-4">
                    <Button variant="outline" size="sm">
                        Settings
                    </Button>
                </div>
            </div>
        </div>
    );
}
