"use client";
import { useScroll } from "@/hooks/use-scroll";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchSuggestions } from "@/components/search-suggestions";
import { usePathname } from "next/navigation";

export function Header({ children }: { children: React.ReactNode }) {
    const scrolled = useScroll(10);
    const pathname = usePathname()
    if (pathname.startsWith("/dashboard")) return null
    return (
        <header
            className={cn(
                "sticky top-0 z-50 mx-auto w-full max-w-4xl border-transparent border-b md:rounded-md md:border md:transition-all md:ease-out",
                {
                    "border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50 md:top-2 md:max-w-3xl md:shadow":
                        scrolled,
                }
            )}
        >
            <nav
                className={cn(
                    "flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
                    {
                        "md:px-2": scrolled,
                    }
                )}
            >
                <div className="flex items-center gap-2">
                    <a className="rounded-md p-2 hover:bg-accent" href="#">
                        <Logo className="h-4.5" />
                    </a>
                </div>

                <div className="hidden flex-1 items-center justify-center md:flex px-4">
                    <SearchSuggestions
                        placeholder="Search jobs..."
                        className="w-full max-w-sm"
                        inputClassName="bg-muted"
                        navigateOnSelect={true}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden items-center gap-1 md:flex">
                        <ThemeToggle />
                        {children}
                    </div>
                    <MobileNav>
                        {children}
                    </MobileNav>
                </div>
            </nav>
        </header>
    );
}
