"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, FileText, Briefcase, User, UserCircle2 } from "lucide-react"
import { toast } from "sonner"
import { getApplicationById, updateApplicationStatus } from "@/lib/actions/applications"

type Application = {
    id: string
    fullName: string
    gender: string
    email: string
    phone: string
    jobId: string
    jobName: string
    cvUrl: string | null
    coverLetter: string | null
    status: string
    appliedAt: Date
    experience: string | null
    location: string | null
}

export default function ApplicationDetailPage() {
    const params = useParams()
    const router = useRouter()
    const applicationId = params.application_id as string

    const [application, setApplication] = React.useState<Application | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isUpdating, setIsUpdating] = React.useState(false)

    // Fetch application data
    React.useEffect(() => {
        async function fetchApplication() {
            try {
                const data = await getApplicationById(applicationId)
                setApplication(data)
            } catch (error) {
                toast.error("Failed to load application")
            } finally {
                setIsLoading(false)
            }
        }
        fetchApplication()
    }, [applicationId])

    if (isLoading) {
        return (
            <div className="w-full p-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <p className="text-muted-foreground">Loading application...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!application) {
        return (
            <div className="w-full p-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Application Not Found</h1>
                    </div>
                </div>
                <p className="text-muted-foreground">The application you're looking for doesn't exist.</p>
            </div>
        )
    }

    const handleAccept = async () => {
        setIsUpdating(true)
        try {
            await updateApplicationStatus(application.id, "accepted")
            toast.success(`Application from ${application.fullName} accepted`)
            router.push("/dashboard/applications")
        } catch (error) {
            toast.error("Failed to accept application")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleReject = async () => {
        setIsUpdating(true)
        try {
            await updateApplicationStatus(application.id, "rejected")
            toast.error(`Application from ${application.fullName} rejected`)
            router.push("/dashboard/applications")
        } catch (error) {
            toast.error("Failed to reject application")
        } finally {
            setIsUpdating(false)
        }
    }

    const formatDate = (dateString: Date) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return (
        <div className="w-full p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Application Details</h1>
                    <p className="text-muted-foreground mt-1">
                        Review and manage this application
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReject}>
                        Reject Application
                    </Button>
                    <Button onClick={handleAccept}>
                        Accept Application
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Applicant Information */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">{application.fullName}</CardTitle>
                                <CardDescription className="mt-2 flex items-center gap-2">
                                    {application.gender === "male" ? (
                                        <User className="h-4 w-4 text-blue-600" />
                                    ) : (
                                        <UserCircle2 className="h-4 w-4 text-pink-600" />
                                    )}
                                    <span className="capitalize">{application.gender}</span>
                                </CardDescription>
                            </div>
                            <Badge
                                variant={
                                    application.status === "accepted"
                                        ? "default"
                                        : application.status === "rejected"
                                            ? "destructive"
                                            : "secondary"
                                }
                                className="text-base px-4 py-1"
                            >
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{application.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{application.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Location</p>
                                    <p className="font-medium">{application.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Briefcase className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Experience</p>
                                    <p className="font-medium">{application.experience}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Job Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Applied For</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Position</p>
                                <p className="text-lg font-semibold">{application.jobName}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Applied At</p>
                                    <p className="font-medium">{formatDate(application.appliedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Cover Letter */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cover Letter</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                            {application.coverLetter}
                        </p>
                    </CardContent>
                </Card>

                {/* CV */}
                <Card>
                    <CardHeader>
                        <CardTitle>Curriculum Vitae</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => toast.info(`Opening CV: ${application.cvUrl}`)}
                        >
                            <FileText className="h-5 w-5 mr-2" />
                            {application.cvUrl}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
