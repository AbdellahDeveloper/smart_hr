"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    ArrowLeft,
    Bookmark,
    Briefcase,
    Building2,
    Calendar,
    Clock,
    DollarSign,
    MapPin,
    Users,
    X
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ApplyForm } from "./apply-form"
import { useSavedJobs } from "@/hooks/use-saved-jobs"
import { cn } from "@/lib/utils"


interface JobDetailsClientProps {
    job: {
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
        description: string
        tags: string[]
        postedAt: string
        applicants: number
        user?: {
            companyName: string | null
            image: string | null
        }
    }
}

function formatSalary(min: number, max: number, currency: string): string {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0,
    })
    return `${formatter.format(min)} - ${formatter.format(max)}`
}

function formatEmploymentType(type: string): string {
    return type.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join('-')
}

function formatWorkMode(mode: string): string {
    if (mode === "onsite") return "On-site"
    return mode.charAt(0).toUpperCase() + mode.slice(1)
}

export function JobDetailsClient({ job }: JobDetailsClientProps) {
    const [showApplyForm, setShowApplyForm] = useState(false)
    const postedDate = new Date(job.postedAt)
    const { isJobSaved, toggleSaveJob } = useSavedJobs()
    const isSaved = isJobSaved(job.id)

    // Auto-open apply form if URL has #apply hash
    useEffect(() => {
        if (typeof window !== "undefined" && window.location.hash === "#apply") {
            setShowApplyForm(true)
        }
    }, [])

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            {/* Header with back button and save button */}
            <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" asChild className="-ml-2">
                    <Link href="/jobs" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Jobs
                    </Link>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSaveJob(job.id)}
                    className={cn(
                        "gap-2 transition-colors",
                        isSaved && "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                    )}
                >
                    <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
                    {isSaved ? "Saved" : "Save Job"}
                </Button>
            </div>


            {/* Apply Form - Full Width when shown */}
            {showApplyForm && (
                <ApplyForm
                    jobId={job.id}
                    jobTitle={job.position}
                    onCancel={() => setShowApplyForm(false)}
                />
            )}

            {!showApplyForm && (
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Job header */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    <Avatar className="h-16 w-16 rounded-lg">
                                        <AvatarImage src={job.logo || undefined} alt={job.company} />
                                        <AvatarFallback className="rounded-lg bg-muted text-lg">
                                            {job.company.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h1 className="text-2xl font-bold mb-1">{job.position}</h1>
                                        <p className="text-lg text-muted-foreground mb-4">{job.company}</p>

                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary" className="gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {job.location}
                                            </Badge>
                                            <Badge variant="secondary" className="gap-1">
                                                <Briefcase className="h-3 w-3" />
                                                {formatEmploymentType(job.employmentType)}
                                            </Badge>
                                            <Badge variant="secondary" className="gap-1">
                                                <Building2 className="h-3 w-3" />
                                                {formatWorkMode(job.workMode)}
                                            </Badge>
                                            <Badge variant="secondary" className="gap-1">
                                                <DollarSign className="h-3 w-3" />
                                                {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Job description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Job Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    {job.description.split('\n').map((paragraph, i) => (
                                        <p key={i}>{paragraph}</p>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills & tags */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Skills & Requirements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {job.tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="rounded-full">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Job Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-muted-foreground">Posted</p>
                                        <p className="font-medium">{formatDistanceToNow(postedDate, { addSuffix: true })}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center gap-3 text-sm">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-muted-foreground">Applicants</p>
                                        <p className="font-medium">{job.applicants} applied</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-muted-foreground">Employment Type</p>
                                        <p className="font-medium">{formatEmploymentType(job.employmentType)}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center gap-3 text-sm">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-muted-foreground">Work Mode</p>
                                        <p className="font-medium">{formatWorkMode(job.workMode)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={() => setShowApplyForm(true)}
                        >
                            Apply Now
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
