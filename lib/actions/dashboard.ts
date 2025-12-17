"use server"

import { prisma } from "@/lib/prisma"

export type DashboardStats = {
    totalJobs: number
    openJobs: number
    closedJobs: number
    totalApplications: number
    pendingApplications: number
    acceptedApplications: number
    rejectedApplications: number
    recentApplications: {
        month: string
        count: number
    }[]
    applicationsByStatus: {
        status: string
        count: number
    }[]
    jobsByType: {
        type: string
        count: number
    }[]
}

// Get dashboard statistics for a user
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
        // Get job counts
        const jobs = await prisma.job.findMany({
            where: { userId },
            select: {
                status: true,
                employmentType: true,
            }
        })

        const totalJobs = jobs.length
        const openJobs = jobs.filter(j => j.status === "open").length
        const closedJobs = jobs.filter(j => j.status === "closed").length

        // Get jobs by employment type
        const jobsByType = [
            { type: "Full-time", count: jobs.filter(j => j.employmentType === "full-time").length },
            { type: "Part-time", count: jobs.filter(j => j.employmentType === "part-time").length },
            { type: "Contract", count: jobs.filter(j => j.employmentType === "contract").length },
        ].filter(j => j.count > 0)

        // Get application counts
        const applications = await prisma.application.findMany({
            where: {
                job: { userId }
            },
            select: {
                status: true,
                appliedAt: true,
            }
        })

        const totalApplications = applications.length
        const pendingApplications = applications.filter(a => a.status === "pending").length
        const acceptedApplications = applications.filter(a => a.status === "accepted").length
        const rejectedApplications = applications.filter(a => a.status === "rejected").length

        // Applications by status for pie chart
        const applicationsByStatus = [
            { status: "Pending", count: pendingApplications },
            { status: "Accepted", count: acceptedApplications },
            { status: "Rejected", count: rejectedApplications },
        ].filter(a => a.count > 0)

        // Recent applications by month (last 6 months)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const recentApps = applications.filter(a => new Date(a.appliedAt) >= sixMonthsAgo)

        const monthCounts: Record<string, number> = {}
        for (let i = 5; i >= 0; i--) {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            const monthKey = date.toLocaleString('default', { month: 'short' })
            monthCounts[monthKey] = 0
        }

        recentApps.forEach(app => {
            const monthKey = new Date(app.appliedAt).toLocaleString('default', { month: 'short' })
            if (monthCounts[monthKey] !== undefined) {
                monthCounts[monthKey]++
            }
        })

        const recentApplications = Object.entries(monthCounts).map(([month, count]) => ({
            month,
            count,
        }))

        return {
            totalJobs,
            openJobs,
            closedJobs,
            totalApplications,
            pendingApplications,
            acceptedApplications,
            rejectedApplications,
            recentApplications,
            applicationsByStatus,
            jobsByType,
        }
    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        throw new Error("Failed to fetch dashboard stats")
    }
}
