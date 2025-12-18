"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bookmark, Clock, DollarSign, MapPin, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useSavedJobs } from "@/hooks/use-saved-jobs"
import { cn } from "@/lib/utils"

export interface Job {
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
    postedAt: string | Date
    applicants: number
}

interface JobCardProps {
    job: Job
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

function formatPostedAt(date: string | Date): string {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date
        return formatDistanceToNow(dateObj, { addSuffix: true })
    } catch {
        return 'Recently'
    }
}

export function JobCard({ job }: JobCardProps) {
    const isRemote = job.workMode === "remote"
    const { isJobSaved, toggleSaveJob } = useSavedJobs()
    const isSaved = isJobSaved(job.id)

    const handleSaveClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        toggleSaveJob(job.id)
    }

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent >
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <Avatar className="h-12 w-12 rounded-lg border-none">
                            <AvatarImage src={job.logo || undefined} alt={job.company} className="object-cover" />
                            <AvatarFallback className="rounded-lg bg-muted text-muted-foreground">
                                {job.company.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-lg font-semibold leading-none mb-1.5">{job.position}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{job.company}</p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    <span>{job.location}</span>
                                </div>
                                {isRemote && (
                                    <Badge variant="secondary" className="font-normal text-muted-foreground bg-muted hover:bg-muted/80">
                                        Remote
                                    </Badge>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <DollarSign className="h-4 w-4" />
                                    <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span>{formatEmploymentType(job.employmentType)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className={cn(
                            "h-8 w-8 rounded-full transition-colors",
                            isSaved && "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                        )}
                        onClick={handleSaveClick}
                    >
                        <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
                        <span className="sr-only">{isSaved ? "Unsave job" : "Save job"}</span>
                    </Button>
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {job.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                    {job.tags.slice(0, 5).map((tag) => (
                        <Badge key={tag} variant="outline" className="rounded-full font-normal">
                            {tag}
                        </Badge>
                    ))}
                    {job.tags.length > 5 && (
                        <Badge variant="outline" className="rounded-full font-normal">
                            +{job.tags.length - 5} more
                        </Badge>
                    )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>{formatPostedAt(job.postedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            <span>{job.applicants} applicants</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/jobs/${job.id}`}>View Details</Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/jobs/${job.id}#apply`}>Quick Apply</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
