import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const job = await prisma.job.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { applications: true }
                },
                user: {
                    select: {
                        companyName: true,
                        image: true
                    }
                }
            }
        })

        if (!job) {
            return NextResponse.json(
                { error: "Job not found" },
                { status: 404 }
            )
        }

        // Only return open jobs for public view
        if (job.status !== "open") {
            return NextResponse.json(
                { error: "Job is no longer available" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            ...job,
            applicants: job._count.applications,
            _count: undefined
        })
    } catch (error) {
        console.error("Error fetching job:", error)
        return NextResponse.json(
            { error: "Failed to fetch job" },
            { status: 500 }
        )
    }
}
