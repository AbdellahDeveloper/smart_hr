"use client"

import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { SiteHeader } from "@/app/dashboard/_components/site-header"
import { AppSidebar } from "@/components/app-sidebar"
import { AppRightSidebar, useRightSidebar } from "@/components/app-right-sidebar"
import { RightSidebar } from "@/components/right-sidebar"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"

function DashboardLayoutContent({
    children,
}: {
    children: React.ReactNode
}) {
    const { open } = useRightSidebar()
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={open ? 75 : 100} minSize={30}>
                    <SidebarInset>
                        <SiteHeader />
                        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                            {children}
                        </div>
                    </SidebarInset>
                </ResizablePanel>
                {open && (
                    <>
                        <ResizableHandle className=" h-screen" />
                        <ResizablePanel defaultSize={25} minSize={15} maxSize={50}>
                            <RightSidebar variant="inset" />
                        </ResizablePanel>
                    </>
                )}
            </ResizablePanelGroup>
        </SidebarProvider>
    )
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AppRightSidebar>
            <DashboardLayoutContent>
                {children}
            </DashboardLayoutContent>
        </AppRightSidebar>
    )
}
