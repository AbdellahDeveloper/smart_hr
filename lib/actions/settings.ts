"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type UserSettings = {
    companyName: string | null
    firstName: string | null
    lastName: string | null
    profilePicture: string | null
}

export type UpdateSettingsInput = {
    companyName?: string
    firstName?: string
    lastName?: string
    profilePicture?: string
}

// Get user settings
export async function getSettings(userId: string): Promise<UserSettings | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                companyName: true,
                firstName: true,
                lastName: true,
                profilePicture: true
            }
        })

        return user
    } catch (error) {
        console.error("Error fetching settings:", error)
        throw new Error("Failed to fetch settings")
    }
}

// Update user settings
export async function updateSettings(userId: string, data: UpdateSettingsInput) {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(data.companyName !== undefined && { companyName: data.companyName }),
                ...(data.firstName !== undefined && { firstName: data.firstName }),
                ...(data.lastName !== undefined && { lastName: data.lastName }),
                ...(data.profilePicture !== undefined && { profilePicture: data.profilePicture }),
            }
        })

        revalidatePath("/dashboard/settings")
        return user
    } catch (error) {
        console.error("Error updating settings:", error)
        throw new Error("Failed to update settings")
    }
}

// Get full user profile
export async function getUserProfile(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                firstName: true,
                lastName: true,
                companyName: true,
                profilePicture: true,
                image: true
            }
        })

        return user
    } catch (error) {
        console.error("Error fetching user profile:", error)
        throw new Error("Failed to fetch user profile")
    }
}
