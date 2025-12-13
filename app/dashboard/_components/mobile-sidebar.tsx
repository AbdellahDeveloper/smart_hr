"use client"

import { Menu } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SidebarNav } from "./sidebar-nav"
import { navItems } from "./sidebar"
import { useState } from "react"

export function MobileSidebar() {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] px-0 bg-sidebar text-sidebar-foreground border-r-sidebar-border">
                <SheetHeader className="px-4 border-b pb-4">
                    <SheetTitle className="text-left text-foreground">Smart HR</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                    <SidebarNav items={navItems} className="px-2" onItemClick={() => setOpen(false)} />
                </div>
            </SheetContent>
        </Sheet>
    )
}
