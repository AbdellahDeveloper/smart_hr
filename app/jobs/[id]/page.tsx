import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
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
    try {
        const job = await prisma.job.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        companyName: true,
                        image: true,
                    }
                },
                _count: {
                    select: { applications: true }
                }
            }
        })

        if (!job) {
            return null
        }

        return {
            id: job.id,
            position: job.position,
            company: job.company,
            logo: job.logo,
            location: job.location,
            employmentType: job.employmentType,
            workMode: job.workMode,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            salaryCurrency: job.salaryCurrency,
            description: job.description,
            tags: job.tags,
            postedAt: job.postedAt.toISOString(),
            applicants: job._count.applications,
            user: job.user ? {
                companyName: job.user.companyName,
                image: job.user.image,
            } : undefined
        }
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
