"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getJobById, updateJob } from "@/lib/actions/jobs"

type Job = {
    id: string
    position: string
    company: string
    logo: string | null
    location: string
    employmentType: string
    workMode: string
    salaryMin: number
    salaryMax: number
    salaryCurrency: string
    status: string
    description: string
    tags: string[]
    postedAt: Date
    applicants: number
}

export default function JobEditPage() {
    const params = useParams()
    const router = useRouter()
    const jobId = params.job_id as string

    // Form state
    const [formData, setFormData] = React.useState<Job | null>(null)
    const [originalJob, setOriginalJob] = React.useState<Job | null>(null)
    const [tagsInput, setTagsInput] = React.useState("")
    const [currency, setCurrency] = React.useState("USD")
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSaving, setIsSaving] = React.useState(false)

    // Fetch job data
    React.useEffect(() => {
        async function fetchJob() {
            try {
                const job = await getJobById(jobId)
                if (job) {
                    setOriginalJob(job)
                    setFormData(job)
                    setTagsInput(job.tags.join(", "))
                    setCurrency(job.salaryCurrency || "USD")
                }
            } catch (error) {
                toast.error("Failed to load job")
            } finally {
                setIsLoading(false)
            }
        }
        fetchJob()
    }, [jobId])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-muted-foreground">Loading job...</p>
                </div>
            </div>
        )
    }

    if (!originalJob || !formData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Job Not Found</h1>
                    <p className="text-muted-foreground mb-4">The job you're looking for doesn't exist.</p>
                    <Button onClick={() => router.push("/dashboard/jobs")}>
                        Back to Jobs
                    </Button>
                </div>
            </div>
        )
    }

    const handleInputChange = (field: keyof Job, value: string | number | string[]) => {
        setFormData((prev) => prev ? { ...prev, [field]: value } : null)
    }

    const handleTagsChange = (value: string) => {
        setTagsInput(value)
        const tagsArray = value.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
        handleInputChange("tags", tagsArray)
    }

    const handleSave = async () => {
        if (!formData) return

        setIsSaving(true)
        try {
            await updateJob(jobId, {
                position: formData.position,
                company: formData.company,
                logo: formData.logo || undefined,
                location: formData.location,
                employmentType: formData.employmentType as "full-time" | "part-time" | "contract",
                workMode: formData.workMode as "onsite" | "hybrid" | "remote",
                salaryMin: formData.salaryMin,
                salaryMax: formData.salaryMax,
                salaryCurrency: formData.salaryCurrency,
                status: formData.status as "open" | "closed",
                description: formData.description,
                tags: formData.tags,
            })
            toast.success("Job updated successfully!")
            router.push("/dashboard/jobs")
        } catch (error) {
            toast.error("Failed to update job")
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setFormData(originalJob)
        setTagsInput(originalJob.tags.join(", "))
        toast.info("Changes discarded")
    }

    const formatEmploymentType = (type: string) => {
        return type.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join('-')
    }

    return (
        <div className="min-h-screen pb-12">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Job</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Update job details and information
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
                {/* Basic Information */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Job Position</h3>
                            <p className="text-sm text-muted-foreground">
                                The title of the job position
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                value={formData.position}
                                onChange={(e) => handleInputChange("position", e.target.value)}
                                placeholder="e.g., Senior Frontend Engineer"
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter a clear and descriptive job title
                            </p>
                        </div>
                    </div>
                </div>


                {/* Location & Work Details */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Location</h3>
                            <p className="text-sm text-muted-foreground">
                                Where the job is based
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                value={formData.location}
                                onChange={(e) => handleInputChange("location", e.target.value)}
                                placeholder="e.g., San Francisco, CA"
                            />
                            <p className="text-xs text-muted-foreground">
                                City and state or country
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Work Mode</h3>
                            <p className="text-sm text-muted-foreground">
                                How the work will be performed
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Select
                                value={formData.workMode}
                                onValueChange={(value: "onsite" | "hybrid" | "remote") =>
                                    handleInputChange("workMode", value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="remote">Remote</SelectItem>
                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                    <SelectItem value="onsite">Onsite</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Select the work arrangement
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Employment Type</h3>
                            <p className="text-sm text-muted-foreground">
                                The type of employment contract
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Select
                                value={formData.employmentType}
                                onValueChange={(value: "full-time" | "part-time" | "contract") =>
                                    handleInputChange("employmentType", value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full-time">Full-Time</SelectItem>
                                    <SelectItem value="part-time">Part-Time</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Choose the employment contract type
                            </p>
                        </div>
                    </div>
                </div>

                {/* Compensation */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Salary Range</h3>
                            <p className="text-sm text-muted-foreground">
                                {formData.employmentType === "contract"
                                    ? "Hourly rate range"
                                    : "Annual salary range"}
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currency">
                                    Currency
                                </Label>
                                <Select
                                    value={currency}
                                    onValueChange={(value) => {
                                        setCurrency(value)
                                        handleInputChange("salaryCurrency", value)
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="GBP">GBP (£)</SelectItem>
                                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                                        <SelectItem value="CAD">CAD ($)</SelectItem>
                                        <SelectItem value="AUD">AUD ($)</SelectItem>
                                        <SelectItem value="INR">INR (₹)</SelectItem>
                                        <SelectItem value="MAD">MAD (د.م.)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salaryMin">
                                    Minimum {formData.employmentType === "contract" ? "(per hour)" : "(annual)"}
                                </Label>
                                <Input
                                    id="salaryMin"
                                    type="number"
                                    value={formData.salaryMin}
                                    onChange={(e) => handleInputChange("salaryMin", Number(e.target.value))}
                                    placeholder={formData.employmentType === "contract" ? "80" : "150000"}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salaryMax">
                                    Maximum {formData.employmentType === "contract" ? "(per hour)" : "(annual)"}
                                </Label>
                                <Input
                                    id="salaryMax"
                                    type="number"
                                    value={formData.salaryMax}
                                    onChange={(e) => handleInputChange("salaryMax", Number(e.target.value))}
                                    placeholder={formData.employmentType === "contract" ? "120" : "200000"}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {formData.employmentType === "contract"
                                    ? "Enter the hourly rate range"
                                    : "Enter the annual salary range"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Job Details */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Job Description</h3>
                            <p className="text-sm text-muted-foreground">
                                Detailed description of the role
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="Enter job description..."
                                className="min-h-[120px]"
                            />
                            <p className="text-xs text-muted-foreground">
                                Provide a comprehensive description of the job
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Skills & Tags</h3>
                            <p className="text-sm text-muted-foreground">
                                Required skills and technologies
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                value={tagsInput}
                                onChange={(e) => handleTagsChange(e.target.value)}
                                placeholder="e.g., React, TypeScript, Next.js"
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Separate tags with commas
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Job Status</h3>
                            <p className="text-sm text-muted-foreground">
                                Current status of the job posting
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Select
                                value={formData.status}
                                onValueChange={(value: "open" | "closed") =>
                                    handleInputChange("status", value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Set whether the job is open or closed
                            </p>
                        </div>
                    </div>
                </div>

                {/* Metadata (Read-only) */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Posted Date</h3>
                            <p className="text-sm text-muted-foreground">
                                When the job was posted
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                value={formData.postedAt.toISOString()}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                This field is read-only
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold">Total Applicants</h3>
                            <p className="text-sm text-muted-foreground">
                                Number of applications received
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                value={formData.applicants}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                This field is read-only
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
