"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { RightSidebarTrigger } from "@/components/app-right-sidebar"

export function SiteHeader() {
    return (
        <header className="flex justify-between h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            <div className="flex items-center gap-2">
                <RightSidebarTrigger />
                <Separator orientation="vertical" className="h-4" />
                <ThemeToggle />
            </div>
        </header>
    )
}
