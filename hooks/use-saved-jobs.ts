"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "smart_hr_saved_jobs"

export function useSavedJobs() {
    const [savedJobIds, setSavedJobIds] = useState<string[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Load saved jobs from local storage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem(STORAGE_KEY)
                if (stored) {
                    const parsed = JSON.parse(stored)
                    if (Array.isArray(parsed)) {
                        setSavedJobIds(parsed)
                    }
                }
            } catch (error) {
                console.error("Failed to load saved jobs from local storage:", error)
            }
            setIsLoaded(true)
        }
    }, [])

    // Persist to local storage whenever savedJobIds changes
    useEffect(() => {
        if (isLoaded && typeof window !== "undefined") {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(savedJobIds))
            } catch (error) {
                console.error("Failed to save jobs to local storage:", error)
            }
        }
    }, [savedJobIds, isLoaded])

    const saveJob = useCallback((id: string) => {
        setSavedJobIds((prev) => {
            if (prev.includes(id)) return prev
            return [...prev, id]
        })
    }, [])

    const unsaveJob = useCallback((id: string) => {
        setSavedJobIds((prev) => prev.filter((jobId) => jobId !== id))
    }, [])

    const toggleSaveJob = useCallback((id: string) => {
        setSavedJobIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((jobId) => jobId !== id)
            }
            return [...prev, id]
        })
    }, [])

    const isJobSaved = useCallback((id: string) => {
        return savedJobIds.includes(id)
    }, [savedJobIds])

    const clearSavedJobs = useCallback(() => {
        setSavedJobIds([])
    }, [])

    return {
        savedJobIds,
        saveJob,
        unsaveJob,
        toggleSaveJob,
        isJobSaved,
        clearSavedJobs,
        isLoaded,
    }
}
