"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { JobCard, type Job } from "@/components/job-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useSavedJobs } from "@/hooks/use-saved-jobs"
import { ArrowLeft, Bookmark, Trash2 } from "lucide-react"

function JobsSkeleton() {
    return (
        <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-6 space-y-4">
                    <div className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-1/3" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-14 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function SavedJobsPage() {
    const { savedJobIds, clearSavedJobs, isLoaded } = useSavedJobs()
    const [allJobs, setAllJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch all jobs once on mount
    useEffect(() => {
        async function fetchAllJobs() {
            if (!isLoaded) return

            try {
                setLoading(true)
                setError(null)

                const response = await fetch("/api/jobs?limit=100")
                if (!response.ok) {
                    throw new Error("Failed to fetch jobs")
                }

                const data = await response.json()
                setAllJobs(data.jobs)
            } catch (err) {
                console.error("Error fetching jobs:", err)
                setError("Failed to load saved jobs. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchAllJobs()
    }, [isLoaded])

    // Filter jobs locally based on savedJobIds - this updates instantly when jobs are saved/unsaved
    const savedJobs = allJobs.filter((job) => savedJobIds.includes(job.id))

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" asChild className="-ml-2">
                    <Link href="/jobs" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Jobs
                    </Link>
                </Button>
                {savedJobIds.length > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSavedJobs}
                        className="gap-2 text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                        Clear All
                    </Button>
                )}
            </div>

            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Saved Jobs</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Your collection of saved job opportunities. Review and apply when you&apos;re ready.
                </p>
            </div>

            {/* Loading state */}
            {loading && <JobsSkeleton />}

            {/* Error state */}
            {!loading && error && (
                <div className="text-center py-12 border rounded-lg bg-destructive/10">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && savedJobs.length === 0 && (
                <div className="text-center py-16 border rounded-lg bg-muted/20">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <Bookmark className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No saved jobs yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Start exploring job opportunities and save the ones that interest you.
                        They&apos;ll appear here for easy access.
                    </p>
                    <Button asChild>
                        <Link href="/jobs">Browse Jobs</Link>
                    </Button>
                </div>
            )}

            {/* Jobs list */}
            {!loading && !error && savedJobs.length > 0 && (
                <div className="space-y-6">
                    <div className="grid gap-4">
                        {savedJobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                        {savedJobs.length} saved {savedJobs.length === 1 ? "job" : "jobs"}
                    </div>
                </div>
            )}
        </div>
    )
}
