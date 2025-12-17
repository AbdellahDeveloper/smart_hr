"use client"

import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { SiteHeader } from "@/app/dashboard/_components/site-header"
import { AppSidebar } from "@/components/app-sidebar"
import { useRightSidebar } from "@/components/app-right-sidebar"
import { RightSidebar } from "@/components/right-sidebar"


interface DashboardLayoutContentProps {
    children: React.ReactNode
    userProfile?: {
        id?: string
        name?: string
        email?: string
        firstName: string | null
        lastName: string | null
        companyName?: string | null
        profilePicture: string | null
        image?: string | null
    } | null
}

export default function DashboardLayoutContent({
    children,
    userProfile,
}: DashboardLayoutContentProps) {
    const { open } = useRightSidebar()

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" userProfile={userProfile} />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full overflow-auto">
                    {children}
                </div>
                {open && (
                    <div className="fixed top-0 right-0 h-screen w-[350px] z-50 border-l bg-background shadow-lg">
                        <RightSidebar variant="inset" />
                    </div>
                )}
            </SidebarInset>
        </SidebarProvider>
    )
}
