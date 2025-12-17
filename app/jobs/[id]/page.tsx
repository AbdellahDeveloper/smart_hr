import { notFound } from "next/navigation"
import { JobDetailsClient } from "./_components/job-details-client"

interface JobDetails {
    id: string
    position: string
    company: string
    logo: string | null
    location: string
    employmentType: string
    workMode: string
    salaryMin: number
    salaryMax: number
    salaryCurrency: string
    description: string
    tags: string[]
    postedAt: string
    applicants: number
    user?: {
        companyName: string | null
        image: string | null
    }
}

async function getJob(id: string): Promise<JobDetails | null> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    try {
        const response = await fetch(`${baseUrl}/api/jobs/${id}`, {
            cache: "no-store",
        })

        if (!response.ok) {
            return null
        }

        return response.json()
    } catch {
        return null
    }
}

export default async function JobDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const job = await getJob(id)

    if (!job) {
        notFound()
    }

    return <JobDetailsClient job={job} />
}
