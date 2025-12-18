"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { CheckCircle2, FileText, Loader2, Upload, X, ArrowLeft } from "lucide-react"
import { createThumbnail } from "@mkholt/pdf-thumbnail"

interface ApplyFormProps {
    jobId: string
    jobTitle: string
    onCancel?: () => void
}

interface FormErrors {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    gender?: string
    cv?: string
}

export function ApplyForm({ jobId, jobTitle, onCancel }: ApplyFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isSuccess, setIsSuccess] = React.useState(false)

    // Form state
    const [firstName, setFirstName] = React.useState("")
    const [lastName, setLastName] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [phone, setPhone] = React.useState("")
    const [gender, setGender] = React.useState("")
    const [experience, setExperience] = React.useState("")
    const [coverLetter, setCoverLetter] = React.useState("")
    const [formErrors, setFormErrors] = React.useState<FormErrors>({})

    // CV upload state
    const [cvFile, setCvFile] = React.useState<File | null>(null)
    const [cvUrl, setCvUrl] = React.useState<string | null>(null)
    const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null)
    const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(null)
    const [isUploading, setIsUploading] = React.useState(false)
    const [uploadError, setUploadError] = React.useState<string | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const validateForm = (): boolean => {
        const errors: FormErrors = {}

        if (!firstName.trim() || firstName.trim().length < 2) {
            errors.firstName = "First name must be at least 2 characters"
        }

        if (!lastName.trim() || lastName.trim().length < 2) {
            errors.lastName = "Last name must be at least 2 characters"
        }

        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Please enter a valid email address"
        }

        if (!phone.trim() || phone.trim().length < 5) {
            errors.phone = "Phone number must be at least 5 characters"
        }

        if (!gender) {
            errors.gender = "Please select a gender"
        }

        if (!cvUrl) {
            errors.cv = "CV is required - please upload a PDF file"
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (file.type !== "application/pdf") {
            setUploadError("Only PDF files are allowed")
            toast.error("Only PDF files are allowed")
            return
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError("File size must be less than 5MB")
            toast.error("File size must be less than 5MB")
            return
        }

        setUploadError(null)
        setFormErrors(prev => ({ ...prev, cv: undefined }))
        setCvFile(file)
        setIsUploading(true)

        try {
            // Generate thumbnail on the frontend
            let thumbnailDataUrl: string | null = null
            try {
                // Create object URL for the file to pass to createThumbnail
                const fileUrl = URL.createObjectURL(file)
                const thumb = await createThumbnail(fileUrl)
                URL.revokeObjectURL(fileUrl)

                if (thumb && typeof thumb === "string") {
                    thumbnailDataUrl = thumb
                    setThumbnailPreview(thumb)
                }
            } catch (thumbError) {
                console.error("Error generating thumbnail:", thumbError)
                // Continue without thumbnail
            }

            // Upload PDF and thumbnail to S3
            const formData = new FormData()
            formData.append("file", file)
            if (thumbnailDataUrl) {
                formData.append("thumbnail", thumbnailDataUrl)
            }

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Failed to upload file")
            }

            setCvUrl(result.url)
            setThumbnailUrl(result.thumbnailUrl || null)
            toast.success("CV uploaded successfully")
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to upload file"
            setUploadError(errorMessage)
            toast.error(errorMessage)
            setCvFile(null)
            setThumbnailPreview(null)
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemoveFile = () => {
        setCvFile(null)
        setCvUrl(null)
        setThumbnailUrl(null)
        setThumbnailPreview(null)
        setUploadError(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error("Please fill in all required fields correctly")
            return
        }

        setIsSubmitting(true)

        const data = {
            fullName: `${firstName.trim()} ${lastName.trim()}`,
            gender: gender,
            email: email.trim(),
            phone: phone.trim(),
            experience: experience.trim() || undefined,
            coverLetter: coverLetter.trim() || undefined,
            cvUrl: cvUrl,
            thumbnailUrl: thumbnailUrl || "",
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
                throw new Error(result.details || result.error || "Failed to submit application")
            }

            setIsSuccess(true)
            toast.success("Application submitted successfully!")
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Something went wrong"
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        if (onCancel) {
            onCancel()
        } else {
            router.push("/jobs")
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center py-12 px-8 max-w-md">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Application Submitted!</h3>
                    <p className="text-muted-foreground mb-8">
                        Thank you for applying for the <span className="font-medium text-foreground">{jobTitle}</span> position. We&apos;ll review your application and get back to you soon.
                    </p>
                    <Button onClick={() => router.push("/jobs")} size="lg">
                        Browse More Jobs
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-12">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Apply for Position</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {jobTitle}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {!isSubmitting && (
                            <Button variant="outline" onClick={handleCancel}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        )}
                        <Button onClick={handleSubmit} disabled={isSubmitting || isUploading}>
                            <LoadingSwap isLoading={isSubmitting}>
                                Submit Application
                            </LoadingSwap>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
                {/* Personal Information */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">First Name *</h3>
                            <p className="text-sm text-muted-foreground">
                                Your first name
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                value={firstName}
                                onChange={(e) => {
                                    setFirstName(e.target.value)
                                    setFormErrors(prev => ({ ...prev, firstName: undefined }))
                                }}
                                placeholder="John"
                                className={formErrors.firstName ? "border-red-500" : ""}
                            />
                            {formErrors.firstName && (
                                <p className="text-sm text-red-500">{formErrors.firstName}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Last Name *</h3>
                            <p className="text-sm text-muted-foreground">
                                Your last name
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                value={lastName}
                                onChange={(e) => {
                                    setLastName(e.target.value)
                                    setFormErrors(prev => ({ ...prev, lastName: undefined }))
                                }}
                                placeholder="Doe"
                                className={formErrors.lastName ? "border-red-500" : ""}
                            />
                            {formErrors.lastName && (
                                <p className="text-sm text-red-500">{formErrors.lastName}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Gender *</h3>
                            <p className="text-sm text-muted-foreground">
                                Select your gender
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Select
                                value={gender}
                                onValueChange={(value) => {
                                    setGender(value)
                                    setFormErrors(prev => ({ ...prev, gender: undefined }))
                                }}
                            >
                                <SelectTrigger className={`w-full ${formErrors.gender ? "border-red-500" : ""}`}>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                            {formErrors.gender && (
                                <p className="text-sm text-red-500">{formErrors.gender}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Email Address *</h3>
                            <p className="text-sm text-muted-foreground">
                                Your primary email address
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    setFormErrors(prev => ({ ...prev, email: undefined }))
                                }}
                                placeholder="john@example.com"
                                className={formErrors.email ? "border-red-500" : ""}
                            />
                            {formErrors.email && (
                                <p className="text-sm text-red-500">{formErrors.email}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Phone Number *</h3>
                            <p className="text-sm text-muted-foreground">
                                Your contact phone number
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="tel"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value)
                                    setFormErrors(prev => ({ ...prev, phone: undefined }))
                                }}
                                placeholder="+1 (555) 123-4567"
                                className={formErrors.phone ? "border-red-500" : ""}
                            />
                            {formErrors.phone && (
                                <p className="text-sm text-red-500">{formErrors.phone}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Experience */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Years of Experience</h3>
                            <p className="text-sm text-muted-foreground">
                                Your relevant work experience
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="number"
                                min="0"
                                max="50"
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                placeholder="5"
                            />
                            <p className="text-xs text-muted-foreground">
                                Optional - Enter a number
                            </p>
                        </div>
                    </div>
                </div>

                {/* CV Upload */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Resume / CV *</h3>
                            <p className="text-sm text-muted-foreground">
                                Upload your resume in PDF format (max 5MB)
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors hover:border-primary/50 ${formErrors.cv ? "border-red-500" : ""}`}>
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
                                    <div className="flex items-start gap-4">
                                        {/* Thumbnail Preview */}
                                        {thumbnailPreview ? (
                                            <div className="flex-shrink-0 w-20 h-28 bg-muted rounded-md overflow-hidden border">
                                                <img
                                                    src={thumbnailPreview}
                                                    alt="CV Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex-shrink-0 w-20 h-28 bg-muted rounded-md flex items-center justify-center border">
                                                {isUploading ? (
                                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                                ) : (
                                                    <FileText className="h-8 w-8 text-red-500" />
                                                )}
                                            </div>
                                        )}

                                        {/* File Info */}
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {cvFile.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                            {isUploading && (
                                                <p className="text-xs text-primary mt-1">Uploading...</p>
                                            )}
                                            {cvUrl && !isUploading && (
                                                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Uploaded successfully
                                                </div>
                                            )}
                                        </div>

                                        {/* Remove Button */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 flex-shrink-0"
                                            onClick={handleRemoveFile}
                                            disabled={isUploading}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                            {formErrors.cv && (
                                <p className="text-sm text-red-500">{formErrors.cv}</p>
                            )}
                            {uploadError && (
                                <p className="text-sm text-red-500">{uploadError}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cover Letter */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Cover Letter</h3>
                            <p className="text-sm text-muted-foreground">
                                Tell us why you&apos;re interested in this position
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Textarea
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                                className="min-h-[120px]"
                            />
                            <p className="text-xs text-muted-foreground">
                                Optional - Share your motivation and qualifications
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
