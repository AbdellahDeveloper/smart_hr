"use client"

import * as React from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function JobsFilter() {
    return (
        <div className="space-y-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search jobs by title, department, or company..."
                        className="pl-9 h-10 bg-background/50"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 h-10">
                        <SlidersHorizontal className="h-4 w-4" />
                        Hide Filters
                    </Button>
                    <Button variant="ghost" className="h-10 text-muted-foreground hover:text-foreground">
                        Reset Filters
                    </Button>
                </div>
            </div>

            {/* Filter Dropdowns Row */}
            <div className="flex flex-wrap gap-3">
                <FilterDropdown label="All Departments" />
                <FilterDropdown label="All Locations" />
                <FilterDropdown label="All Types" />
                <FilterDropdown label="All Types" /> {/* Assuming 'All Types' duplicated in image or implies diff cat */}
                <FilterDropdown label="All Levels" />
            </div>
        </div>
    )
}

function FilterDropdown({ label }: { label: string }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between gap-2 min-w-[140px] font-normal">
                    {label}
                    {/* Chevron down could go here, or handled by styling */}
                    <span className="sr-only">Open menu</span>
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
                <DropdownMenuItem>Option 1</DropdownMenuItem>
                <DropdownMenuItem>Option 2</DropdownMenuItem>
                <DropdownMenuItem>Option 3</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
