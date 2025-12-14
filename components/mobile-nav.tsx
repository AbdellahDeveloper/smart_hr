"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";

export function MobileNav({ children }: { children: React.ReactNode }) {
    const { setTheme, theme } = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);

    // Close menu when resizing to desktop to avoid weird states
    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Prevent scrolling when menu is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    return (
        <div className="md:hidden">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {isOpen && (
                <div className="absolute top-14 left-0 w-full bg-background border-b shadow-lg p-4 flex flex-col gap-6 animate-in slide-in-from-top-5 duration-200">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search jobs..."
                            className="w-full rounded-full bg-muted pl-9 h-9"
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2 w-full">
                            {children}
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                            <Button
                                variant={theme === "light" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setTheme("light")}
                                className="w-full"
                            >
                                <Sun className="h-4 w-4 mr-2" />
                                Light
                            </Button>
                            <Button
                                variant={theme === "dark" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setTheme("dark")}
                                className="w-full"
                            >
                                <Moon className="h-4 w-4 mr-2" />
                                Dark
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
