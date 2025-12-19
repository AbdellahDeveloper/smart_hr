import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { JobCard, type Job } from "@/components/job-card"
import { JobsFilter } from "@/components/jobs-filter"
import { Skeleton } from "@/components/ui/skeleton"

interface SearchParams {
    search?: string
    employmentType?: string
    workMode?: string
    location?: string
    page?: string
}

async function getJobs(searchParams: SearchParams): Promise<{
    jobs: Job[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
}> {
    const page = parseInt(searchParams.page || "1")
    const limit = 10

    // Build where clause
    const where: Record<string, unknown> = {
        status: "open"
    }

    if (searchParams.search) {
        where.OR = [
            { position: { contains: searchParams.search, mode: "insensitive" } },
            { company: { contains: searchParams.search, mode: "insensitive" } },
            { description: { contains: searchParams.search, mode: "insensitive" } },
        ]
    }

    if (searchParams.employmentType) {
        where.employmentType = searchParams.employmentType
    }

    if (searchParams.workMode) {
        where.workMode = searchParams.workMode
    }

    if (searchParams.location) {
        where.location = { contains: searchParams.location, mode: "insensitive" }
    }

    const [jobs, total] = await Promise.all([
        prisma.job.findMany({
            where,
            orderBy: { postedAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
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
        }),
        prisma.job.count({ where })
    ])

    const mappedJobs: Job[] = jobs.map(job => ({
        id: job.id,
        position: job.position,
        company: job.company,
        logo: job.logo,
        location: job.location,
        employmentType: job.employmentType as Job["employmentType"],
        workMode: job.workMode as Job["workMode"],
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: job.salaryCurrency,
        status: job.status as Job["status"],
        description: job.description,
        tags: job.tags,
        postedAt: job.postedAt.toISOString(),
        applicants: job._count.applications,
    }))

    return {
        jobs: mappedJobs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}

function JobsSkeleton() {
    return (
        <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-6 space-y-4">
                    <div className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-1/3" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-14 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    )
}

async function JobsList({ searchParams }: { searchParams: SearchParams }) {
    const { jobs, pagination } = await getJobs(searchParams)

    if (jobs.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground">
                    Try adjusting your search or filters to find more opportunities.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4">
                {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
            </div>

            {/* Pagination info */}
            <div className="text-center text-sm text-muted-foreground">
                Showing {jobs.length} of {pagination.total} jobs
                {pagination.totalPages > 1 && (
                    <span> • Page {pagination.page} of {pagination.totalPages}</span>
                )}
            </div>
        </div>
    )
}

export default async function JobsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Career Opportunities</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Discover your next career opportunity. Browse our open positions and find the perfect role that matches your skills, experience, and career goals.
                </p>
            </div>

            <Suspense fallback={<div className="mb-8 space-y-4"><Skeleton className="h-10 w-full" /></div>}>
                <JobsFilter />
            </Suspense>

            <Suspense fallback={<JobsSkeleton />}>
                <JobsList searchParams={params} />
            </Suspense>
        </div>
    )
}
