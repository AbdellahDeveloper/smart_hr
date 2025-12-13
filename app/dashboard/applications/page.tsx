"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Filter, MoreHorizontal, FileText, Search, X, Venus, Mars, HelpCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"

import applicationsData from "./applications-data.json"
import jobsData from "../data.json"

export type Application = {
    id: string
    fullName: string
    gender: "male" | "female"
    email: string
    phone: string
    jobId: string
    jobName: string
    cvUrl: string
    coverLetter: string
    status: "pending" | "accepted" | "rejected"
    appliedAt: string
    experience: string
    location: string
}

const data: Application[] = applicationsData as Application[]
const jobs = jobsData as any[]

export default function ApplicationsPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilters, setStatusFilters] = React.useState<string[]>([])
    const [genderFilters, setGenderFilters] = React.useState<string[]>([])
    const [jobNameFilters, setJobNameFilters] = React.useState<string[]>([])

    // Get unique job names for filter options
    const uniqueJobNames = React.useMemo(() => {
        return Array.from(new Set(data.map(app => app.jobName))).sort()
    }, [])

    const toggleStatusFilter = (value: string) => {
        setStatusFilters(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        )
    }

    const toggleGenderFilter = (value: string) => {
        setGenderFilters(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        )
    }

    const toggleJobNameFilter = (value: string) => {
        setJobNameFilters(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        )
    }

    const clearAllFilters = () => {
        setStatusFilters([])
        setGenderFilters([])
        setJobNameFilters([])
        setSearchQuery("")
    }

    const getActiveFiltersCount = () => {
        return statusFilters.length + genderFilters.length + jobNameFilters.length
    }

    // Filter applications based on search and filters
    const filteredApplications = data.filter(application => {
        // Search filter
        const matchesSearch =
            application.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            application.jobName.toLowerCase().includes(searchQuery.toLowerCase())

        // Status filter
        const matchesStatus = statusFilters.length === 0 || statusFilters.includes(application.status)

        // Gender filter
        const matchesGender = genderFilters.length === 0 || genderFilters.includes(application.gender)

        // Job name filter
        const matchesJobName = jobNameFilters.length === 0 || jobNameFilters.includes(application.jobName)

        return matchesSearch && matchesStatus && matchesGender && matchesJobName
    })

    const handleCardClick = (applicationId: string) => {
        router.push(`/dashboard/applications/${applicationId}`)
    }

    const handleAccept = (e: React.MouseEvent, application: Application) => {
        e.stopPropagation()
        toast.success(`Application from ${application.fullName} accepted`)
    }

    const handleReject = (e: React.MouseEvent, application: Application) => {
        e.stopPropagation()
        toast.error(`Application from ${application.fullName} rejected`)
    }

    const handleRead = (e: React.MouseEvent, applicationId: string) => {
        e.stopPropagation()
        router.push(`/dashboard/applications/${applicationId}`)
    }

    return (
        <div className="w-full p-6">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background pb-4 mb-2 border-b">
                <div className="pt-2">
                    <h1 className="text-3xl font-bold tracking-tight">Job Applications</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and review all job applications
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or job..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-muted"
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                                onClick={() => setSearchQuery("")}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Filters Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Filter className="mr-2 h-4 w-4" />
                                Filters
                                {getActiveFiltersCount() > 0 && (
                                    <Badge variant="secondary" className="ml-2 rounded-full px-1 min-w-5 h-5">
                                        {getActiveFiltersCount()}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>Status</DropdownMenuLabel>
                            <DropdownMenuCheckboxItem
                                checked={statusFilters.includes("pending")}
                                onCheckedChange={() => toggleStatusFilter("pending")}
                            >
                                Pending
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={statusFilters.includes("accepted")}
                                onCheckedChange={() => toggleStatusFilter("accepted")}
                            >
                                Accepted
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={statusFilters.includes("rejected")}
                                onCheckedChange={() => toggleStatusFilter("rejected")}
                            >
                                Rejected
                            </DropdownMenuCheckboxItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Gender</DropdownMenuLabel>
                            <DropdownMenuCheckboxItem
                                checked={genderFilters.includes("male")}
                                onCheckedChange={() => toggleGenderFilter("male")}
                            >
                                Male
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={genderFilters.includes("female")}
                                onCheckedChange={() => toggleGenderFilter("female")}
                            >
                                Female
                            </DropdownMenuCheckboxItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Job Position</DropdownMenuLabel>
                            {uniqueJobNames.map((jobName) => (
                                <DropdownMenuCheckboxItem
                                    key={jobName}
                                    checked={jobNameFilters.includes(jobName)}
                                    onCheckedChange={() => toggleJobNameFilter(jobName)}
                                >
                                    {jobName}
                                </DropdownMenuCheckboxItem>
                            ))}

                            {getActiveFiltersCount() > 0 && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={clearAllFilters}>
                                        Clear all filters
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="text-sm text-muted-foreground sm:ml-auto">
                        {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {/* Applications Grid */}
            {filteredApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No applications found</h3>
                    <p className="text-muted-foreground mb-4">
                        {searchQuery || getActiveFiltersCount() > 0
                            ? "Try adjusting your search or filters"
                            : "No applications have been submitted yet"}
                    </p>
                    {(searchQuery || getActiveFiltersCount() > 0) && (
                        <Button variant="outline" onClick={clearAllFilters}>
                            Clear filters
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredApplications.map((application) => (
                        <Card
                            key={application.id}
                            className="shadow-none transition-all cursor-pointer group relative overflow-hidden border-2 border-border hover:border-primary pb-0! pt-2!"
                            onClick={() => handleCardClick(application.id)}
                        >
                            <CardContent className="p-3">
                                {/* CV Thumbnail */}
                                <div className="flex justify-center mb-2">
                                    <div className="relative w-full">
                                        {/* A4 aspect ratio container (1:1.414) */}
                                        <div className="w-full relative rounded-lg overflow-hidden border border-border transition-colors" style={{ aspectRatio: '1 / 1.414' }}>
                                            <img
                                                src="/cv-test.jpg"
                                                alt={`${application.fullName} CV`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {/* Status Badge on CV */}
                                        <Badge
                                            variant={
                                                application.status === "accepted"
                                                    ? "default"
                                                    : application.status === "rejected"
                                                        ? "destructive"
                                                        : "secondary"
                                            }
                                            className="absolute -top-2 -right-2 text-xs"
                                        >
                                            {application.status === "accepted"
                                                ? "✓"
                                                : application.status === "rejected"
                                                    ? "✗"
                                                    : "●"}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Applicant Info */}
                                <div className="space-y-2 text-center">
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            {/* Full Name with Gender Icon and Actions */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center justify-center gap-2 flex-1 min-w-0">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="flex-shrink-0">
                                                                    {application.gender === "male" ? (
                                                                        <Mars className="h-4 w-4 text-blue-600" />
                                                                    ) : (
                                                                        <Venus className="h-4 w-4 text-pink-600" />
                                                                    )}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="capitalize">{application.gender}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <h3 className="font-semibold text-base truncate">
                                                        {application.fullName}
                                                    </h3>

                                                </div>
                                            </div>
                                            {/* Job Name with Info Icon */}
                                            <div className="flex items-center gap-1">
                                                <p
                                                    className="text-sm text-muted-foreground line-clamp-2 hover:text-primary cursor-pointer transition-colors underline-offset-4 hover:underline flex-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        router.push(`/dashboard/jobs/${application.jobId}`)
                                                    }}
                                                >
                                                    {application.jobName}
                                                </p>
                                                <Popover>
                                                    <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <button className="shrink-0 hover:text-primary transition-colors">
                                                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-80" side="top" align="start">
                                                        {(() => {
                                                            const job = jobs.find(j => j.id === application.jobId)
                                                            if (!job) return <p className="text-sm">Job details not available</p>

                                                            return (
                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <h4 className="font-semibold text-sm mb-1">{job.position}</h4>
                                                                        <p className="text-xs text-muted-foreground">{job.company} • {job.location}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                                            {job.description}
                                                                        </p>
                                                                    </div>
                                                                    {job.tags && job.tags.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {job.tags.map((tag: string, idx: number) => (
                                                                                <Badge key={idx} variant="secondary" className="text-xs px-2 py-0">
                                                                                    {tag}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        })()}
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                        {/* Three-dot Menu */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 flex-shrink-0"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem onClick={(e) => handleRead(e, application.id)}>
                                                    Read Application
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem
                                                    onClick={(e) => handleAccept(e, application)}
                                                    className="text-green-600 focus:text-green-600"
                                                >
                                                    Accept Application
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={(e) => handleReject(e, application)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    Refuse Application
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
