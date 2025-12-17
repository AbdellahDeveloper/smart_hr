import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        // Parse query parameters
        const search = searchParams.get("search") || ""
        const employmentType = searchParams.get("employmentType")
        const workMode = searchParams.get("workMode")
        const location = searchParams.get("location")
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const skip = (page - 1) * limit

        // Build where clause
        const where: {
            status: string
            employmentType?: string
            workMode?: string
            location?: { contains: string; mode: "insensitive" }
            OR?: Array<{
                position?: { contains: string; mode: "insensitive" }
                company?: { contains: string; mode: "insensitive" }
                description?: { contains: string; mode: "insensitive" }
                tags?: { has: string }
            }>
        } = {
            status: "open", // Only show open jobs
        }

        // Add search filter
        if (search) {
            where.OR = [
                { position: { contains: search, mode: "insensitive" } },
                { company: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { tags: { has: search } },
            ]
        }

        // Add filters
        if (employmentType) {
            where.employmentType = employmentType
        }
        if (workMode) {
            where.workMode = workMode
        }
        if (location) {
            where.location = { contains: location, mode: "insensitive" }
        }

        // Fetch jobs with pagination
        const [jobs, total] = await Promise.all([
            prisma.job.findMany({
                where,
                orderBy: { postedAt: "desc" },
                skip,
                take: limit,
                select: {
                    id: true,
                    position: true,
                    company: true,
                    logo: true,
                    location: true,
                    employmentType: true,
                    workMode: true,
                    salaryMin: true,
                    salaryMax: true,
                    salaryCurrency: true,
                    description: true,
                    tags: true,
                    postedAt: true,
                    _count: {
                        select: { applications: true }
                    }
                }
            }),
            prisma.job.count({ where })
        ])

        // Format response
        const formattedJobs = jobs.map(job => ({
            ...job,
            applicants: job._count.applications,
            _count: undefined
        }))

        return NextResponse.json({
            jobs: formattedJobs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error("Error fetching public jobs:", error)
        return NextResponse.json(
            { error: "Failed to fetch jobs" },
            { status: 500 }
        )
    }
}
