"use server"

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { v4 as uuidv4 } from "uuid"

const BUCKET_NAME = "profile_avatars"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"]

// Initialize S3 client for Supabase Storage
const s3Client = new S3Client({
    endpoint: process.env.ENDPOINT,
    region: process.env.REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true, // Required for S3-compatible services like Supabase
})

export type UploadResult = {
    success: boolean
    url?: string
    error?: string
}

/**
 * Upload a profile picture to S3
 */
export async function uploadProfilePicture(
    formData: FormData,
    userId: string
): Promise<UploadResult> {
    try {
        const file = formData.get("file") as File

        if (!file) {
            return { success: false, error: "No file provided" }
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return {
                success: false,
                error: "Invalid file type. Only PNG, JPG, JPEG, and SVG are allowed."
            }
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return {
                success: false,
                error: "File size must be less than 5MB"
            }
        }

        // Generate unique filename
        const extension = file.name.split('.').pop() || 'png'
        const filename = `${userId}/${uuidv4()}.${extension}`

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: filename,
            Body: buffer,
            ContentType: file.type,
        })

        await s3Client.send(command)

        // Construct the public URL for Supabase Storage
        // Format: ${ENDPOINT}/${BUCKET_NAME}/${filename}
        const url = `${process.env.ENDPOINT}/${BUCKET_NAME}/${filename}`

        return { success: true, url }
    } catch (error) {
        console.error("Error uploading profile picture:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to upload image"
        }
    }
}

/**
 * Delete a profile picture from S3
 */
export async function deleteProfilePicture(imageUrl: string): Promise<boolean> {
    try {
        // Extract the key from the URL
        const url = new URL(imageUrl)
        const key = url.pathname.replace(`/${BUCKET_NAME}/`, "")

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        })

        await s3Client.send(command)
        return true
    } catch (error) {
        console.error("Error deleting profile picture:", error)
        return false
    }
}
