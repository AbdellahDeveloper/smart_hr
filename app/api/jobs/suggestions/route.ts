import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get("q") || ""

        if (!query || query.length < 2) {
            return NextResponse.json({ suggestions: [] })
        }

        // Fetch jobs matching the query by position or location
        const jobs = await prisma.job.findMany({
            where: {
                status: "open",
                OR: [
                    { position: { contains: query, mode: "insensitive" } },
                    { location: { contains: query, mode: "insensitive" } }
                ]
            },
            select: {
                id: true,
                position: true,
                location: true
            },
            take: 8,
            orderBy: { postedAt: "desc" }
        })

        // Format suggestions with job details
        const suggestions = jobs.map(job => ({
            id: job.id,
            position: job.position,
            location: job.location
        }))

        return NextResponse.json({ suggestions })
    } catch (error) {
        console.error("Error fetching job suggestions:", error)
        return NextResponse.json(
            { error: "Failed to fetch suggestions" },
            { status: 500 }
        )
    }
}
