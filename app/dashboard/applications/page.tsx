import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getApplications } from "@/lib/actions/applications"
import ApplicationsTable from "./_components/applications-table"

export default async function ApplicationsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect("/auth")
    }

    const applications = await getApplications(session.user.id)

    return <ApplicationsTable initialApplications={applications} />
}
