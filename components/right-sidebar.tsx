"use client"

import * as React from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar"
import { useRightSidebar } from "@/components/app-right-sidebar"


export function RightSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { open } = useRightSidebar()
    if (!open) {
        return null
    }

    return (
        <Sidebar side="right" collapsible="none" variant="inset" {...props}>
            <SidebarHeader className="border-b px-4 py-3">
                <h2 className="text-lg font-semibold">AI Assistant</h2>
                <p className="text-sm text-muted-foreground">
                    Chat with our HR Recommendation Assistant
                </p>
            </SidebarHeader>
            <SidebarContent className="p-0">
            </SidebarContent>
            <SidebarFooter>
            </SidebarFooter>
        </Sidebar>
    )
}
