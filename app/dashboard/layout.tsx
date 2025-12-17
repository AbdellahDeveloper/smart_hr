import { AppRightSidebar } from "@/components/app-right-sidebar"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { resendOtp } from "../actions/auth"
import { getUserProfile } from "@/lib/actions/settings"
import DashboardLayoutContent from "./_components/dashboard-layout-content"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        redirect("/auth");
    }
    if (!session.user.emailVerified) {
        await resendOtp(session.user.email);
        redirect(`/auth/verify-email?email=${encodeURIComponent(session.user.email)}`);
    }

    const userProfile = await getUserProfile(session.user.id);

    return (
        <AppRightSidebar>
            <DashboardLayoutContent userProfile={userProfile}>
                {children}
            </DashboardLayoutContent>
        </AppRightSidebar>
    )
}

