"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
import { createJob } from "@/lib/actions/jobs"
import { useSession } from "@/lib/auth-client"
import { LoadingSwap } from "@/components/ui/loading-swap"

type JobFormData = {
    position: string
    company: string
    logo: string
    location: string
    employmentType: "full-time" | "part-time" | "contract"
    workMode: "onsite" | "hybrid" | "remote"
    salaryMin: number
    salaryMax: number
    salaryCurrency: string
    status: "open" | "closed"
    description: string
    tags: string[]
}

export default function JobCreatePage() {
    const router = useRouter()
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = React.useState(false)

    // Form state with default values
    const [formData, setFormData] = React.useState<JobFormData>({
        position: "",
        company: "",
        logo: "",
        location: "",
        employmentType: "full-time",
        workMode: "remote",
        salaryMin: 0,
        salaryMax: 0,
        salaryCurrency: "USD",
        status: "open",
        description: "",
        tags: [],
    })
    const [tagsInput, setTagsInput] = React.useState("")
    const [currency, setCurrency] = React.useState("USD")

    const handleInputChange = (field: keyof JobFormData, value: string | number | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleTagsChange = (value: string) => {
        setTagsInput(value)
        const tagsArray = value.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
        handleInputChange("tags", tagsArray)
    }

    const handleCreate = async () => {
        // Validation
        if (!formData.position.trim()) {
            toast.error("Please enter a job position")
            return
        }
        if (!formData.location.trim()) {
            toast.error("Please enter a location")
            return
        }
        if (!formData.description.trim()) {
            toast.error("Please enter a job description")
            return
        }
        if (formData.salaryMin <= 0 || formData.salaryMax <= 0) {
            toast.error("Please enter valid salary range")
            return
        }
        if (formData.salaryMin >= formData.salaryMax) {
            toast.error("Maximum salary must be greater than minimum salary")
            return
        }
        if (!session?.user?.id) {
            toast.error("You must be logged in to create a job")
            return
        }

        setIsLoading(true)
        try {
            await createJob({
                ...formData,
                userId: session.user.id,
            })
            toast.success("Job created successfully!")
            router.push("/dashboard/jobs")
        } catch (error) {
            toast.error("Failed to create job")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        router.push("/dashboard/jobs")
    }

    return (
        <div className="min-h-screen pb-12">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create New Job</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Add a new job posting to your organization
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {!isLoading && (
                            <Button variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                        )}
                        <Button onClick={handleCreate} disabled={isLoading}>
                            <LoadingSwap isLoading={isLoading}>
                                Create Job
                            </LoadingSwap>
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
                                    value={formData.salaryMin || ""}
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
                                    value={formData.salaryMax || ""}
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
            </div>
        </div>
    )
}
