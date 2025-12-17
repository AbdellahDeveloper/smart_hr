"use client"

import * as React from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
} from "@/components/ui/sidebar"
import { useRightSidebar } from "@/components/app-right-sidebar"
import { Chatbot } from "@/components/chatbot"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"


export function RightSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { open, toggleSidebar } = useRightSidebar()
    if (!open) {
        return null
    }

    return (
        <Sidebar className="w-full" side="right" collapsible="none" variant="inset" {...props}>
            <SidebarHeader className="border-b px-4 py-3 w-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">AI Assistant</h2>
                        <p className="text-sm text-muted-foreground">
                            Chat with our HR Recommendation Assistant
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={toggleSidebar}
                    >
                        <X className="size-4" />
                        <span className="sr-only">Close sidebar</span>
                    </Button>
                </div>
            </SidebarHeader>
            <SidebarContent className="p-0 w-full">
                <Chatbot />
            </SidebarContent>
        </Sidebar>
    )
}
