import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
    region: process.env.REGION || "us-east-1",
    endpoint: process.env.ENDPOINT || undefined,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID || "",
        secretAccessKey: process.env.SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true, // Required for some S3-compatible services
})

const CV_BUCKET = "cvs"
const THUMBNAIL_BUCKET = "cv_thumbnails"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function constructUrl(bucket: string, key: string): string {
    const endpoint = process.env.ENDPOINT
    const region = process.env.REGION || "us-east-1"

    if (endpoint) {
        // For S3-compatible services (MinIO, DigitalOcean Spaces, etc.)
        return `${endpoint}/${bucket}/${key}`
    } else {
        // For AWS S3
        return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File | null
        const thumbnail = formData.get("thumbnail") as string | null // Base64 data URL

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            )
        }

        // Validate file type - PDF only
        if (file.type !== "application/pdf") {
            return NextResponse.json(
                { error: "Only PDF files are allowed" },
                { status: 400 }
            )
        }

        // Validate file size (max 5MB)
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File size must be less than 5MB" },
                { status: 400 }
            )
        }

        // Generate unique filename
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 8)
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
        const key = `${timestamp}-${randomString}-${sanitizedName}`

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload PDF to S3
        const uploadCommand = new PutObjectCommand({
            Bucket: CV_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: "application/pdf",
            ContentDisposition: `attachment; filename="${file.name}"`,
        })

        await s3Client.send(uploadCommand)

        // Upload thumbnail if provided
        let thumbnailUrl: string | null = null
        if (thumbnail && thumbnail.startsWith("data:image/png;base64,")) {
            try {
                const thumbnailKey = `${timestamp}-${randomString}-${sanitizedName.replace(".pdf", ".png")}`

                // Convert base64 to buffer
                const base64Data = thumbnail.replace("data:image/png;base64,", "")
                const thumbnailBuffer = Buffer.from(base64Data, "base64")

                const thumbnailCommand = new PutObjectCommand({
                    Bucket: THUMBNAIL_BUCKET,
                    Key: thumbnailKey,
                    Body: thumbnailBuffer,
                    ContentType: "image/png",
                })

                await s3Client.send(thumbnailCommand)
                thumbnailUrl = constructUrl(THUMBNAIL_BUCKET, thumbnailKey)
            } catch (thumbnailError) {
                console.error("Error uploading thumbnail:", thumbnailError)
                // Continue without thumbnail - don't fail the whole upload
            }
        }

        const fileUrl = constructUrl(CV_BUCKET, key)

        return NextResponse.json({
            url: fileUrl,
            thumbnailUrl: thumbnailUrl,
            key: key,
            filename: file.name,
            size: file.size
        })

    } catch (error) {
        console.error("Error uploading file to S3:", error)
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        )
    }
}
