"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface NavItem {
    title: string
    href: string
    icon: LucideIcon
    items?: {
        title: string
        href: string
    }[]
}

interface SidebarNavProps {
    items: NavItem[]
    collapsed?: boolean
    className?: string
    onItemClick?: () => void
}

export function SidebarNav({ items, collapsed, className, onItemClick }: SidebarNavProps) {
    const pathname = usePathname()

    return (
        <nav className={cn("group flex flex-col gap-2 py-2", className)}>
            <TooltipProvider delayDuration={0}>
                {items.map((item, index) => {
                    return (
                        <SidebarNavItem
                            key={index}
                            item={item}
                            collapsed={collapsed}
                            pathname={pathname}
                            onItemClick={onItemClick}
                        />
                    )
                })}
            </TooltipProvider>
        </nav>
    )
}

interface SidebarNavItemProps {
    item: NavItem
    collapsed?: boolean
    pathname: string
    onItemClick?: () => void
}

function SidebarNavItem({ item, collapsed, pathname, onItemClick }: SidebarNavItemProps) {
    const [isOpen, setIsOpen] = useState(false)
    const isActive = pathname === item.href || item.items?.some((sub) => pathname === sub.href)

    // Automatically expand if a child is active
    useEffect(() => {
        if (isActive) {
            setIsOpen(true)
        }
    }, [isActive])

    if (item.items) {
        return (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
                <div className="relative flex items-center">
                    {collapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={cn(
                                        "h-10 w-10 p-0",
                                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                                    )}
                                    onClick={() => setIsOpen(!isOpen)}
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span className="sr-only">{item.title}</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="flex items-center gap-4">
                                {item.title}
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                </div>
                                {isOpen ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </Button>
                        </CollapsibleTrigger>
                    )}
                </div>

                <CollapsibleContent className="space-y-1">
                    {!collapsed && item.items.map((subItem) => {
                        const isSubActive = pathname === subItem.href
                        return (
                            <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={onItemClick}
                                className={cn(
                                    "block rounded-md py-2 pl-10 pr-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-ring",
                                    isSubActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                )}
                            >
                                {subItem.title}
                            </Link>
                        )
                    })}
                </CollapsibleContent>
            </Collapsible>
        )
    }

    return (
        collapsed ? (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href={item.href}
                        onClick={onItemClick}
                        className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2",
                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        <span className="sr-only">{item.title}</span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                    {item.title}
                </TooltipContent>
            </Tooltip>
        ) : (
            <Link
                href={item.href}
                onClick={onItemClick}
                className={cn(
                    "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
            >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
            </Link>
        )
    )
}
