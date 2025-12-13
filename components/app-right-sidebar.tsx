"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { PanelRightIcon } from "lucide-react"

// Create a separate context for the right sidebar
type RightSidebarContextProps = {
    state: "expanded" | "collapsed"
    open: boolean
    setOpen: (open: boolean) => void
    toggleSidebar: () => void
}

const RightSidebarContext = React.createContext<RightSidebarContextProps | null>(null)

export function useRightSidebar() {
    const context = React.useContext(RightSidebarContext)
    if (!context) {
        throw new Error("useRightSidebar must be used within a RightSidebarProvider.")
    }
    return context
}

function RightSidebarProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)
    const state = open ? "expanded" : "collapsed"

    const toggleSidebar = React.useCallback(() => {
        setOpen(prev => !prev)
    }, [])

    const contextValue = React.useMemo<RightSidebarContextProps>(
        () => ({
            state,
            open,
            setOpen,
            toggleSidebar,
        }),
        [state, open, toggleSidebar]
    )

    return (
        <RightSidebarContext.Provider value={contextValue}>
            {children}
        </RightSidebarContext.Provider>
    )
}

// Right sidebar trigger button
export function RightSidebarTrigger({
    className,
    onClick,
    ...props
}: React.ComponentProps<typeof Button>) {
    const { toggleSidebar } = useRightSidebar()

    return (
        <Button
            data-sidebar="trigger"
            variant="ghost"
            size="icon"
            className={`size-7 ${className || ""}`}
            onClick={(event) => {
                onClick?.(event)
                toggleSidebar()
            }}
            {...props}
        >
            <PanelRightIcon className="size-4" />
            <span className="sr-only">Toggle Right Sidebar</span>
        </Button>
    )
}

export function AppRightSidebar({ children }: { children?: React.ReactNode }) {
    return (
        <RightSidebarProvider>
            {children}
        </RightSidebarProvider>
    )
}
