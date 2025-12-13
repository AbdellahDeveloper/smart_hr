"use client"

import { useState } from "react"
import { LayoutDashboard, Briefcase, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { SidebarNav } from "./sidebar-nav"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const navItems = [
    {
        title: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Jobs",
        href: "/dashboard/job",
        icon: Briefcase,
        items: [
            {
                title: "Open Positions",
                href: "/dashboard/job/open-positions",
            },
            {
                title: "Job Applications",
                href: "/dashboard/job/applications",
            },
        ],
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
]

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <aside
            className={cn(
                "hidden border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col transition-all duration-300 relative",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex flex-row gap-4 items-center px-4 py-4 border-b border-foreground/10">
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@abdellah_elidrissi" />
                    <AvatarFallback>AE</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                    <span className="font-semibold text-sm">Abdellah Elidrissi</span>
                    <span className="text-xs font-bold text-muted-foreground">abdellah.elidrissi@gmail.com</span>
                </div>
            </div>

            <div className="flex-1 overflow-auto py-2">
                <SidebarNav items={navItems} collapsed={isCollapsed} className="px-2" />
            </div>

            <div className="border-t p-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto w-full flex items-center justify-center h-8"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>
        </aside>
    )
}
