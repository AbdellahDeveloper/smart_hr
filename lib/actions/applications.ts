"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type CreateApplicationInput = {
    fullName: string
    gender: "male" | "female"
    email: string
    phone: string
    cvUrl?: string
    coverLetter?: string
    experience?: string
    location?: string
    jobId: string
}

export type UpdateApplicationInput = Partial<Omit<CreateApplicationInput, "jobId">> & {
    status?: "pending" | "accepted" | "rejected"
}

// Get all applications for a user's jobs
export async function getApplications(userId: string) {
    try {
        const applications = await prisma.application.findMany({
            where: {
                job: {
                    userId: userId
                }
            },
            include: {
                job: {
                    select: {
                        id: true,
                        position: true,
                        company: true,
                        description: true,
                        tags: true
                    }
                }
            },
            orderBy: { appliedAt: "desc" }
        })

        // Map to include jobName for compatibility
        return applications.map(app => ({
            ...app,
            jobName: app.job.position
        }))
    } catch (error) {
        console.error("Error fetching applications:", error)
        throw new Error("Failed to fetch applications")
    }
}

// Get a single application by ID
export async function getApplicationById(applicationId: string) {
    try {
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                job: {
                    select: {
                        id: true,
                        position: true,
                        company: true,
                        description: true,
                        tags: true
                    }
                }
            }
        })

        if (!application) return null

        return {
            ...application,
            jobName: application.job.position
        }
    } catch (error) {
        console.error("Error fetching application:", error)
        throw new Error("Failed to fetch application")
    }
}

// Create a new application
export async function createApplication(data: CreateApplicationInput) {
    try {
        const application = await prisma.application.create({
            data: {
                fullName: data.fullName,
                gender: data.gender,
                email: data.email,
                phone: data.phone,
                cvUrl: data.cvUrl || "",
                coverLetter: data.coverLetter || "",
                experience: data.experience || "",
                location: data.location || "",
                jobId: data.jobId,
            }
        })

        // Update application count on the job
        await prisma.job.update({
            where: { id: data.jobId },
            data: { applicants: { increment: 1 } }
        })

        revalidatePath("/dashboard/applications")
        return application
    } catch (error) {
        console.error("Error creating application:", error)
        throw new Error("Failed to create application")
    }
}

// Update application status
export async function updateApplicationStatus(
    applicationId: string,
    status: "pending" | "accepted" | "rejected"
) {
    try {
        const application = await prisma.application.update({
            where: { id: applicationId },
            data: { status }
        })

        revalidatePath("/dashboard/applications")
        revalidatePath(`/dashboard/applications/${applicationId}`)
        return application
    } catch (error) {
        console.error("Error updating application status:", error)
        throw new Error("Failed to update application status")
    }
}

// Update application details
export async function updateApplication(
    applicationId: string,
    data: UpdateApplicationInput
) {
    try {
        const application = await prisma.application.update({
            where: { id: applicationId },
            data: {
                ...(data.fullName && { fullName: data.fullName }),
                ...(data.gender && { gender: data.gender }),
                ...(data.email && { email: data.email }),
                ...(data.phone && { phone: data.phone }),
                ...(data.cvUrl !== undefined && { cvUrl: data.cvUrl }),
                ...(data.coverLetter !== undefined && { coverLetter: data.coverLetter }),
                ...(data.experience !== undefined && { experience: data.experience }),
                ...(data.location !== undefined && { location: data.location }),
                ...(data.status && { status: data.status }),
            }
        })

        revalidatePath("/dashboard/applications")
        revalidatePath(`/dashboard/applications/${applicationId}`)
        return application
    } catch (error) {
        console.error("Error updating application:", error)
        throw new Error("Failed to update application")
    }
}

// Delete an application
export async function deleteApplication(applicationId: string) {
    try {
        // Get the jobId before deleting
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            select: { jobId: true }
        })

        if (!application) throw new Error("Application not found")

        await prisma.application.delete({
            where: { id: applicationId }
        })

        // Decrement application count on the job
        await prisma.job.update({
            where: { id: application.jobId },
            data: { applicants: { decrement: 1 } }
        })

        revalidatePath("/dashboard/applications")
        return { success: true }
    } catch (error) {
        console.error("Error deleting application:", error)
        throw new Error("Failed to delete application")
    }
}
