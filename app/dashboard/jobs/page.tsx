import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getJobs } from "@/lib/actions/jobs"
import JobsTable from "./_components/jobs-table"

export default async function JobsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect("/auth")
    }

    const jobs = await getJobs(session.user.id)

    return <JobsTable initialJobs={jobs} />
}
