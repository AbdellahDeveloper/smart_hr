"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Filter, MoreHorizontal, FileText, Search, X, Venus, Mars, HelpCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { updateApplicationStatus, deleteApplication } from "@/lib/actions/applications"

export type Application = {
    id: string
    fullName: string
    gender: string
    email: string
    phone: string
    cvUrl: string | null
    coverLetter: string | null
    status: string
    appliedAt: Date
    experience: string | null
    location: string | null
    jobId: string
    jobName: string
    job: {
        id: string
        position: string
        company: string
        description: string
        tags: string[]
    }
}

interface ApplicationsTableProps {
    initialApplications: Application[]
}

export default function ApplicationsTable({ initialApplications }: ApplicationsTableProps) {
    const router = useRouter()
    const [applications, setApplications] = React.useState<Application[]>(initialApplications)
    const [searchQuery, setSearchQuery] = React.useState("")

    // Multi-select filter states
    const [statusFilters, setStatusFilters] = React.useState<string[]>([])
    const [genderFilters, setGenderFilters] = React.useState<string[]>([])
    const [jobNameFilters, setJobNameFilters] = React.useState<string[]>([])

    const handleRefresh = () => {
        router.refresh()
    }

    // Update applications when initialApplications changes
    React.useEffect(() => {
        setApplications(initialApplications)
    }, [initialApplications])

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

    // Get unique job names for filter
    const uniqueJobNames = [...new Set(applications.map(app => app.jobName))]

    // Filter applications
    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.jobName.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilters.length === 0 || statusFilters.includes(app.status)
        const matchesGender = genderFilters.length === 0 || genderFilters.includes(app.gender)
        const matchesJobName = jobNameFilters.length === 0 || jobNameFilters.includes(app.jobName)

        return matchesSearch && matchesStatus && matchesGender && matchesJobName
    })

    const handleCardClick = (applicationId: string) => {
        router.push(`/dashboard/applications/${applicationId}`)
    }

    const handleAccept = async (e: React.MouseEvent, application: Application) => {
        e.stopPropagation()
        try {
            await updateApplicationStatus(application.id, "accepted")
            toast.success(`Application from ${application.fullName} accepted`)
            handleRefresh()
        } catch (error) {
            toast.error("Failed to accept application")
        }
    }

    const handleReject = async (e: React.MouseEvent, application: Application) => {
        e.stopPropagation()
        try {
            await updateApplicationStatus(application.id, "rejected")
            toast.error(`Application from ${application.fullName} rejected`)
            handleRefresh()
        } catch (error) {
            toast.error("Failed to reject application")
        }
    }

    const handleRead = (e: React.MouseEvent, applicationId: string) => {
        e.stopPropagation()
        router.push(`/dashboard/applications/${applicationId}`)
    }

    const formatDate = (dateString: Date) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    return (
        <div className="w-full p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
                <p className="text-muted-foreground mt-2">
                    Review and manage all job applications
                </p>
            </div>

            <div className="flex items-center py-4 gap-2 flex-wrap">
                {/* Search Input */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search applications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-muted"
                    />
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
                            <Mars className="mr-2 h-4 w-4 text-blue-600" />
                            Male
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={genderFilters.includes("female")}
                            onCheckedChange={() => toggleGenderFilter("female")}
                        >
                            <Venus className="mr-2 h-4 w-4 text-pink-600" />
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
                                    <X className="mr-2 h-4 w-4" />
                                    Clear all filters
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Active filters count */}
                {(getActiveFiltersCount() > 0 || searchQuery) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="gap-1"
                    >
                        <X className="h-4 w-4" />
                        Clear all
                    </Button>
                )}
            </div>

            {/* Applications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {filteredApplications.length > 0 ? (
                    filteredApplications.map((application) => (
                        <Card
                            key={application.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => handleCardClick(application.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                                            {application.gender === "male" ? (
                                                <Mars className="h-5 w-5 text-blue-600" />
                                            ) : (
                                                <Venus className="h-5 w-5 text-pink-600" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{application.fullName}</h3>
                                            <p className="text-sm text-muted-foreground">{application.email}</p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={
                                            application.status === "accepted"
                                                ? "default"
                                                : application.status === "rejected"
                                                    ? "destructive"
                                                    : "secondary"
                                        }
                                    >
                                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                    </Badge>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">Position:</span>
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">{application.jobName}</span>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80">
                                                    <div className="space-y-2">
                                                        <h4 className="font-semibold">{application.job.position}</h4>
                                                        <p className="text-sm text-muted-foreground">{application.job.description}</p>
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {application.job.tags.map((tag, index) => (
                                                                <Badge key={index} variant="secondary" className="text-xs">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">Experience:</span>
                                        <span>{application.experience || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">Applied:</span>
                                        <span>{formatDate(application.appliedAt)}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={(e) => handleRead(e, application.id)}
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        View
                                    </Button>
                                    {application.status === "pending" && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="default"
                                                className="flex-1"
                                                onClick={(e) => handleAccept(e, application)}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="flex-1"
                                                onClick={(e) => handleReject(e, application)}
                                            >
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No applications found
                    </div>
                )}
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground mt-4">
                Showing {filteredApplications.length} of {applications.length} applications
            </div>
        </div>
    )
}
