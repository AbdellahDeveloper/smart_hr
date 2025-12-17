import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const applicationSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    gender: z.enum(["male", "female"]),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(5, "Phone number is required"),
    cvUrl: z.string().url().optional().or(z.literal("")),
    coverLetter: z.string().optional(),
    experience: z.string().optional(),
    location: z.string().optional(),
})

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: jobId } = await params
        const body = await request.json()

        // Validate input
        const validatedData = applicationSchema.parse(body)

        // Check if job exists and is open
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            select: { id: true, status: true }
        })

        if (!job) {
            return NextResponse.json(
                { error: "Job not found" },
                { status: 404 }
            )
        }

        if (job.status !== "open") {
            return NextResponse.json(
                { error: "This job is no longer accepting applications" },
                { status: 400 }
            )
        }

        // Check for existing application with same email
        const existingApplication = await prisma.application.findFirst({
            where: {
                jobId,
                email: validatedData.email
            }
        })

        if (existingApplication) {
            return NextResponse.json(
                { error: "You have already applied for this job" },
                { status: 400 }
            )
        }

        // Create application
        const application = await prisma.application.create({
            data: {
                ...validatedData,
                cvUrl: validatedData.cvUrl || null,
                jobId,
            }
        })

        // Update applicants count on job
        await prisma.job.update({
            where: { id: jobId },
            data: { applicants: { increment: 1 } }
        })

        return NextResponse.json({
            message: "Application submitted successfully",
            applicationId: application.id
        }, { status: 201 })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues.map(issue => issue.message).join(", ") },
                { status: 400 }
            )
        }

        console.error("Error submitting application:", error)
        return NextResponse.json(
            { error: "Failed to submit application" },
            { status: 500 }
        )
    }
}
