"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react"

interface ApplyFormProps {
    jobId: string
    jobTitle: string
}

export function ApplyForm({ jobId, jobTitle }: ApplyFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isSuccess, setIsSuccess] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    // CV upload state
    const [cvFile, setCvFile] = React.useState<File | null>(null)
    const [cvUrl, setCvUrl] = React.useState<string | null>(null)
    const [isUploading, setIsUploading] = React.useState(false)
    const [uploadError, setUploadError] = React.useState<string | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (file.type !== "application/pdf") {
            setUploadError("Only PDF files are allowed")
            return
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError("File size must be less than 5MB")
            return
        }

        setUploadError(null)
        setCvFile(file)
        setIsUploading(true)

        try {
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Failed to upload file")
            }

            setCvUrl(result.url)
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "Failed to upload file")
            setCvFile(null)
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemoveFile = () => {
        setCvFile(null)
        setCvUrl(null)
        setUploadError(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const firstName = formData.get("firstName") as string
        const lastName = formData.get("lastName") as string
        const data = {
            fullName: `${firstName} ${lastName}`.trim(),
            gender: formData.get("gender") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            experience: formData.get("experience") as string,
            coverLetter: formData.get("coverLetter") as string,
            cvUrl: cvUrl || "",
        }

        try {
            const response = await fetch(`/api/jobs/${jobId}/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Failed to submit application")
            }

            setIsSuccess(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/50">
                <CardContent className="pt-6">
                    <div className="text-center py-8">
                        <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Application Submitted!</h3>
                        <p className="text-muted-foreground mb-6">
                            Thank you for applying for the {jobTitle} position. We&apos;ll review your application and get back to you soon.
                        </p>
                        <Button variant="outline" onClick={() => router.push("/jobs")}>
                            Browse More Jobs
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Apply for this Position</CardTitle>
                <CardDescription>
                    Fill out the form below to submit your application for {jobTitle}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                placeholder="John"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                placeholder="Doe"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender *</Label>
                            <Select name="gender" required>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="experience">Years of Experience</Label>
                            <Input
                                id="experience"
                                name="experience"
                                type="number"
                                min="0"
                                max="50"
                                placeholder="5"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                required
                            />
                        </div>
                    </div>

                    {/* CV Upload Section */}
                    <div className="space-y-2">
                        <Label htmlFor="cv">Resume / CV (PDF only, max 5MB)</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center transition-colors hover:border-primary/50">
                            {!cvFile ? (
                                <div className="space-y-2">
                                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                                    <div className="text-sm text-muted-foreground">
                                        <label
                                            htmlFor="cv"
                                            className="text-primary font-medium cursor-pointer hover:underline"
                                        >
                                            Click to upload
                                        </label>
                                        {" "}or drag and drop
                                    </div>
                                    <p className="text-xs text-muted-foreground">PDF only (max 5MB)</p>
                                    <input
                                        ref={fileInputRef}
                                        id="cv"
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={handleFileChange}
                                        className="sr-only"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-8 w-8 text-red-500" />
                                        <div className="text-left">
                                            <p className="text-sm font-medium truncate max-w-[200px]">
                                                {cvFile.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isUploading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : cvUrl ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        ) : null}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={handleRemoveFile}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {uploadError && (
                            <p className="text-sm text-red-600">{uploadError}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="coverLetter">Cover Letter</Label>
                        <Textarea
                            id="coverLetter"
                            name="coverLetter"
                            placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                            rows={5}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={isSubmitting || isUploading}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Application"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
