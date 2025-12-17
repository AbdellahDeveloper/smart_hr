"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchSuggestions } from "@/components/search-suggestions"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const EMPLOYMENT_TYPES = [
    { value: "", label: "All Types" },
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "contract", label: "Contract" },
]

const WORK_MODES = [
    { value: "", label: "All Work Modes" },
    { value: "onsite", label: "On-site" },
    { value: "hybrid", label: "Hybrid" },
    { value: "remote", label: "Remote" },
]

interface JobsFilterProps {
    onSearch?: (params: URLSearchParams) => void
}

export function JobsFilter({ onSearch }: JobsFilterProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [search, setSearch] = React.useState(searchParams.get("search") || "")
    const [employmentType, setEmploymentType] = React.useState(searchParams.get("employmentType") || "")
    const [workMode, setWorkMode] = React.useState(searchParams.get("workMode") || "")
    const [showFilters, setShowFilters] = React.useState(true)

    const updateFilters = React.useCallback((newParams: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString())

        Object.entries(newParams).forEach(([key, value]) => {
            if (value) {
                params.set(key, value)
            } else {
                params.delete(key)
            }
        })

        // Reset to page 1 when filters change
        params.delete("page")

        router.push(`/jobs?${params.toString()}`)
        onSearch?.(params)
    }, [router, searchParams, onSearch])

    const handleSearch = (value: string) => {
        setSearch(value)
        updateFilters({ search: value })
    }

    const handleReset = () => {
        setSearch("")
        setEmploymentType("")
        setWorkMode("")
        router.push("/jobs")
        onSearch?.(new URLSearchParams())
    }

    const hasActiveFilters = search || employmentType || workMode

    return (
        <div className="space-y-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <SearchSuggestions
                    placeholder="Search jobs by title, company, or skills..."
                    className="flex-1"
                    inputClassName="h-10 bg-background/50"
                    value={search}
                    onChange={setSearch}
                    onSearch={handleSearch}
                    navigateOnSelect={false}
                />
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="gap-2 h-10"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        {showFilters ? "Hide Filters" : "Show Filters"}
                    </Button>
                    {hasActiveFilters && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="h-10 text-muted-foreground hover:text-foreground gap-2"
                            onClick={handleReset}
                        >
                            <X className="h-4 w-4" />
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter Dropdowns Row */}
            {showFilters && (
                <div className="flex flex-wrap gap-3">
                    <FilterDropdown
                        label={EMPLOYMENT_TYPES.find(t => t.value === employmentType)?.label || "All Types"}
                        options={EMPLOYMENT_TYPES}
                        value={employmentType}
                        onChange={(value) => {
                            setEmploymentType(value)
                            updateFilters({ employmentType: value })
                        }}
                    />
                    <FilterDropdown
                        label={WORK_MODES.find(m => m.value === workMode)?.label || "All Work Modes"}
                        options={WORK_MODES}
                        value={workMode}
                        onChange={(value) => {
                            setWorkMode(value)
                            updateFilters({ workMode: value })
                        }}
                    />
                </div>
            )}
        </div>
    )
}

interface FilterDropdownProps {
    label: string
    options: { value: string; label: string }[]
    value: string
    onChange: (value: string) => void
}

function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={`justify-between gap-2 min-w-[140px] font-normal ${value ? "border-primary text-primary" : ""}`}
                >
                    {label}
                    <svg
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-auto opacity-50"
                    >
                        <path
                            d="M1 1L5 5L9 1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={value === option.value ? "bg-accent" : ""}
                    >
                        {option.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
