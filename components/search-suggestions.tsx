"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./ui/input-group"

interface Suggestion {
    id: string
    position: string
    location: string
}

interface SearchSuggestionsProps {
    placeholder?: string
    className?: string
    inputClassName?: string
    onSearch?: (value: string) => void
    navigateOnSelect?: boolean
    value?: string
    onChange?: (value: string) => void
}

export function SearchSuggestions({
    placeholder = "Search jobs...",
    className,
    inputClassName,
    onSearch,
    navigateOnSelect = true,
    value: controlledValue,
    onChange: controlledOnChange,
}: SearchSuggestionsProps) {
    const router = useRouter()
    const [internalValue, setInternalValue] = React.useState("")
    const [suggestions, setSuggestions] = React.useState<Suggestion[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [isOpen, setIsOpen] = React.useState(false)
    const [selectedIndex, setSelectedIndex] = React.useState(-1)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const debounceRef = React.useRef<NodeJS.Timeout | null>(null)

    // Support both controlled and uncontrolled modes
    const value = controlledValue !== undefined ? controlledValue : internalValue
    const setValue = (newValue: string) => {
        if (controlledOnChange) {
            controlledOnChange(newValue)
        } else {
            setInternalValue(newValue)
        }
    }

    // Fetch suggestions with debounce
    const fetchSuggestions = React.useCallback(async (query: string) => {
        if (query.length < 2) {
            setSuggestions([])
            setIsOpen(false)
            return
        }

        setIsLoading(true)
        setIsOpen(true)
        try {
            const response = await fetch(`/api/jobs/suggestions?q=${encodeURIComponent(query)}`)
            if (response.ok) {
                const data = await response.json()
                setSuggestions(data.suggestions || [])
                if (data.suggestions?.length === 0) {
                    setIsOpen(false)
                }
            }
        } catch (error) {
            console.error("Error fetching suggestions:", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Handle input change with debounce
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setValue(newValue)
        setSelectedIndex(-1)

        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        debounceRef.current = setTimeout(() => {
            fetchSuggestions(newValue)
        }, 300)
    }

    // Handle suggestion selection - navigate to job page
    const handleSelect = (suggestion: Suggestion) => {
        setValue(suggestion.position)
        setIsOpen(false)
        setSuggestions([])

        // Navigate directly to the job detail page
        router.push(`/jobs/${suggestion.id}`)
    }

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSelect(suggestions[selectedIndex])
        } else if (value.trim()) {
            setIsOpen(false)
            if (navigateOnSelect) {
                router.push(`/jobs?search=${encodeURIComponent(value)}`)
            }
            onSearch?.(value)
        }
    }

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault()
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                )
                break
            case "ArrowUp":
                e.preventDefault()
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
                break
            case "Escape":
                setIsOpen(false)
                setSelectedIndex(-1)
                break
        }
    }

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Cleanup debounce on unmount
    React.useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [])

    // Skeleton loader for suggestions
    const SuggestionsSkeleton = () => (
        <div className="py-2 px-1">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="flex flex-col gap-1 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
            ))}
        </div>
    )

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <InputGroup className={cn("rounded-xl", inputClassName)}>
                        <InputGroupAddon align="inline-start">
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </InputGroupAddon>
                        <InputGroupInput
                            type="search"
                            placeholder={placeholder}
                            className={cn("w-full h-9")}
                            value={value}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() => {
                                if (suggestions.length > 0) setIsOpen(true)
                            }}
                        />
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton type="submit" className="rounded-lg text-xs" variant="default">
                                Search
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>

                </div>
            </form>

            {/* Suggestions Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border bg-popover shadow-lg overflow-hidden">
                    {isLoading ? (
                        <SuggestionsSkeleton />
                    ) : suggestions.length > 0 ? (
                        <ul className="py-1">
                            {suggestions.map((suggestion, index) => (
                                <li key={suggestion.id}>
                                    <button
                                        type="button"
                                        className={cn(
                                            "cursor-pointer flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                                            "hover:bg-accent focus:bg-accent focus:outline-none",
                                            index === selectedIndex && "bg-accent"
                                        )}
                                        onClick={() => handleSelect(suggestion)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    >
                                        <div className="flex flex-col items-start min-w-0">
                                            <span className="font-medium truncate w-full text-left">
                                                {suggestion.position}
                                            </span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {suggestion.location}
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            )}
        </div>
    )
}
