"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type CreateJobInput = {
    position: string
    company: string
    logo?: string
    location: string
    employmentType: "full-time" | "part-time" | "contract"
    workMode: "onsite" | "hybrid" | "remote"
    salaryMin: number
    salaryMax: number
    salaryCurrency?: string
    status?: "open" | "closed"
    description: string
    tags: string[]
    userId: string
}

export type UpdateJobInput = Partial<Omit<CreateJobInput, "userId">>

// Get all jobs for a user
export async function getJobs(userId: string) {
    try {
        const jobs = await prisma.job.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { applications: true }
                }
            }
        })

        // Map applicants count from relation
        return jobs.map(job => ({
            ...job,
            applicants: job._count.applications
        }))
    } catch (error) {
        console.error("Error fetching jobs:", error)
        throw new Error("Failed to fetch jobs")
    }
}

// Get a single job by ID
export async function getJobById(jobId: string) {
    try {
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: {
                _count: {
                    select: { applications: true }
                }
            }
        })

        if (!job) return null

        return {
            ...job,
            applicants: job._count.applications
        }
    } catch (error) {
        console.error("Error fetching job:", error)
        throw new Error("Failed to fetch job")
    }
}

// Create a new job
export async function createJob(data: CreateJobInput) {
    try {
        const job = await prisma.job.create({
            data: {
                position: data.position,
                company: data.company,
                logo: data.logo || "",
                location: data.location,
                employmentType: data.employmentType,
                workMode: data.workMode,
                salaryMin: data.salaryMin,
                salaryMax: data.salaryMax,
                salaryCurrency: data.salaryCurrency || "USD",
                status: data.status || "open",
                description: data.description,
                tags: data.tags,
                userId: data.userId,
            }
        })

        revalidatePath("/dashboard/jobs")
        return job
    } catch (error) {
        console.error("Error creating job:", error)
        throw new Error("Failed to create job")
    }
}

// Update a job
export async function updateJob(jobId: string, data: UpdateJobInput) {
    try {
        const job = await prisma.job.update({
            where: { id: jobId },
            data: {
                ...(data.position && { position: data.position }),
                ...(data.company && { company: data.company }),
                ...(data.logo !== undefined && { logo: data.logo }),
                ...(data.location && { location: data.location }),
                ...(data.employmentType && { employmentType: data.employmentType }),
                ...(data.workMode && { workMode: data.workMode }),
                ...(data.salaryMin !== undefined && { salaryMin: data.salaryMin }),
                ...(data.salaryMax !== undefined && { salaryMax: data.salaryMax }),
                ...(data.salaryCurrency && { salaryCurrency: data.salaryCurrency }),
                ...(data.status && { status: data.status }),
                ...(data.description && { description: data.description }),
                ...(data.tags && { tags: data.tags }),
            }
        })

        revalidatePath("/dashboard/jobs")
        revalidatePath(`/dashboard/jobs/${jobId}`)
        return job
    } catch (error) {
        console.error("Error updating job:", error)
        throw new Error("Failed to update job")
    }
}

// Delete a job
export async function deleteJob(jobId: string) {
    try {
        await prisma.job.delete({
            where: { id: jobId }
        })

        revalidatePath("/dashboard/jobs")
        return { success: true }
    } catch (error) {
        console.error("Error deleting job:", error)
        throw new Error("Failed to delete job")
    }
}

// Toggle job status (open/closed)
export async function toggleJobStatus(jobId: string) {
    try {
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            select: { status: true }
        })

        if (!job) throw new Error("Job not found")

        const newStatus = job.status === "open" ? "closed" : "open"

        const updatedJob = await prisma.job.update({
            where: { id: jobId },
            data: { status: newStatus }
        })

        revalidatePath("/dashboard/jobs")
        return updatedJob
    } catch (error) {
        console.error("Error toggling job status:", error)
        throw new Error("Failed to toggle job status")
    }
}
