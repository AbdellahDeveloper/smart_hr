"use client"

import * as React from "react"
import {
  IconDashboard,
  IconFileDescription,
  IconListDetails,
  IconSettings,
} from "@tabler/icons-react"

import { NavHR } from "@/components/nav-hr"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Logo } from "./logo"
import { useSession } from "@/lib/auth-client"

const data = {
  hrGroup: {
    title: "HR",
    items: [
      {
        title: "Jobs",
        icon: IconFileDescription,
        url: "/dashboard/jobs",
      },
      {
        title: "Applications",
        icon: IconListDetails,
        url: "/dashboard/applications",
      },
    ],
  },
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userProfile?: {
    firstName: string | null
    lastName: string | null
    profilePicture: string | null
  } | null
}

export function AppSidebar({ userProfile, ...props }: AppSidebarProps) {
  const { data: session } = useSession()

  // Build user object from session and profile
  const getDisplayName = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`
    }
    return session?.user?.name || "User"
  }

  const user = {
    name: getDisplayName(),
    email: session?.user?.email || "",
    avatar: userProfile?.profilePicture || session?.user?.image || "",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Logo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="mt-1 mb-2  " />
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem key="Overview">
            <SidebarMenuButton asChild tooltip="Overview">
              <Link className="flex items-center gap-2" href="/dashboard">
                <IconDashboard />
                <span>Overview</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavHR title={data.hrGroup.title} items={data.hrGroup.items} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
