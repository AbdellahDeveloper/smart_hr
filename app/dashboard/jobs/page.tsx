"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Share2, Linkedin, MessageCircle, Copy, Check, Filter } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import jobsData from "../data.json"

export type Job = {
    id: string
    position: string
    company: string
    logo: string
    location: string
    employmentType: "full-time" | "part-time" | "contract"
    workMode: "onsite" | "hybrid" | "remote"
    salaryMin: number
    salaryMax: number
    status: "open" | "closed"
    description: string
    tags: string[]
    postedAt: string
    applicants: number
}

const data: Job[] = jobsData as Job[]

// Share Menu Component
function ShareMenu({ job }: { job: Job }) {
    const [copied, setCopied] = React.useState(false)
    const jobUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/jobs/${job.id}`

    const handleCopyLink = () => {
        navigator.clipboard.writeText(jobUrl)
        setCopied(true)
        toast.success("Link copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
    }

    const handleLinkedInShare = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`
        window.open(url, '_blank')
    }

    const handleWhatsAppShare = () => {
        const text = `Check out this job: ${job.position} at ${job.company}`
        const url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + jobUrl)}`
        window.open(url, '_blank')
    }

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleLinkedInShare}
            >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleWhatsAppShare}
            >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleCopyLink}
            >
                {copied ? (
                    <Check className="h-4 w-4 mr-2" />
                ) : (
                    <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copied!" : "Copy"}
            </Button>
        </div>
    )
}

export const columns: ColumnDef<Job>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "position",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Position
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="font-medium">{row.getValue("position")}</div>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={status === "open" ? "default" : "secondary"}>
                    {status === "open" ? "Open" : "Closed"}
                </Badge>
            )
        },
        filterFn: (row, id, value) => {
            if (!value || value.length === 0) return true
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => <div>{row.getValue("location")}</div>,
    },
    {
        accessorKey: "employmentType",
        header: "Employment Type",
        cell: ({ row }) => {
            const type = row.getValue("employmentType") as string
            const formatted = type.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join('-')
            return <div className="capitalize">{formatted}</div>
        },
        filterFn: (row, id, value) => {
            if (!value || value.length === 0) return true
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "workMode",
        header: "Work Mode",
        cell: ({ row }) => {
            const mode = row.getValue("workMode") as string
            return (
                <Badge variant="outline" className="capitalize">
                    {mode}
                </Badge>
            )
        },
        filterFn: (row, id, value) => {
            if (!value || value.length === 0) return true
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "salary",
        header: () => <div className="text-right">Salary Range</div>,
        cell: ({ row }) => {
            const job = row.original
            const { salaryMin, salaryMax, employmentType } = job

            // Format based on employment type
            if (employmentType === "contract") {
                return (
                    <div className="text-right font-medium">
                        ${salaryMin} - ${salaryMax} / hr
                    </div>
                )
            }

            const formattedMin = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
            }).format(salaryMin)

            const formattedMax = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
            }).format(salaryMax)

            return <div className="text-right font-medium">{formattedMin} - {formattedMax}</div>
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const job = row.original
            const [isShareOpen, setIsShareOpen] = React.useState(false)

            const handleToggleStatus = () => {
                const newStatus = job.status === "open" ? "closed" : "open"
                toast.success(`Job marked as ${newStatus}`)
                // Here you would typically update the job status in your backend
            }

            const handleEdit = () => {
                toast.info("Edit job functionality")
                // Navigate to edit page or open edit modal
            }

            const handleDelete = () => {
                toast.error("Delete job functionality")
                // Show confirmation dialog and delete
            }

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={handleEdit}>
                            Edit Job
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={handleDelete}
                            className="text-destructive focus:text-destructive"
                        >
                            Delete Job
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={handleToggleStatus}>
                            {job.status === "open" ? "Mark As Closed" : "Mark As Open"}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <Popover open={isShareOpen} onOpenChange={setIsShareOpen} modal={true}>
                            <PopoverTrigger asChild>
                                <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    onClick={() => setIsShareOpen(true)}
                                >
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share
                                </DropdownMenuItem>
                            </PopoverTrigger>
                            <PopoverContent
                                side="left"
                                align="start"
                                className="w-auto p-4"
                            >
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm mb-3">Share this job</h4>
                                    <ShareMenu job={job} />
                                </div>
                            </PopoverContent>
                        </Popover>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export default function JobsPage() {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    // Multi-select filter states
    const [statusFilters, setStatusFilters] = React.useState<string[]>([])
    const [workModeFilters, setWorkModeFilters] = React.useState<string[]>([])
    const [employmentTypeFilters, setEmploymentTypeFilters] = React.useState<string[]>([])

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    // Update table filters when multi-select states change
    React.useEffect(() => {
        if (statusFilters.length > 0) {
            table.getColumn("status")?.setFilterValue(statusFilters)
        } else {
            table.getColumn("status")?.setFilterValue(undefined)
        }
    }, [statusFilters, table])

    React.useEffect(() => {
        if (workModeFilters.length > 0) {
            table.getColumn("workMode")?.setFilterValue(workModeFilters)
        } else {
            table.getColumn("workMode")?.setFilterValue(undefined)
        }
    }, [workModeFilters, table])

    React.useEffect(() => {
        if (employmentTypeFilters.length > 0) {
            table.getColumn("employmentType")?.setFilterValue(employmentTypeFilters)
        } else {
            table.getColumn("employmentType")?.setFilterValue(undefined)
        }
    }, [employmentTypeFilters, table])

    const toggleStatusFilter = (value: string) => {
        setStatusFilters(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        )
    }

    const toggleWorkModeFilter = (value: string) => {
        setWorkModeFilters(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        )
    }

    const toggleEmploymentTypeFilter = (value: string) => {
        setEmploymentTypeFilters(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        )
    }

    const clearAllFilters = () => {
        setStatusFilters([])
        setWorkModeFilters([])
        setEmploymentTypeFilters([])
        table.resetColumnFilters()
    }

    const getActiveFiltersCount = () => {
        return statusFilters.length + workModeFilters.length + employmentTypeFilters.length
    }

    return (
        <div className="w-full p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
                <p className="text-muted-foreground mt-2">
                    Manage and track all job postings
                </p>
            </div>

            <div className="flex items-center py-4 gap-2">
                <Input
                    placeholder="Filter by position..."
                    value={(table.getColumn("position")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("position")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm bg-muted"
                />

                {/* Bulk Actions - Only show when rows are selected */}
                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <MoreHorizontal className="mr-2 h-4 w-4" />
                                Bulk Actions ({table.getFilteredSelectedRowModel().rows.length})
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    const count = table.getFilteredSelectedRowModel().rows.length
                                    toast.success(`${count} job(s) deleted`)
                                    table.resetRowSelection()
                                    // Here you would typically delete the selected jobs from your backend
                                }}
                                className="text-destructive focus:text-destructive"
                            >
                                Delete Selected
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

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
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuLabel>Status</DropdownMenuLabel>
                        <DropdownMenuCheckboxItem
                            checked={statusFilters.includes("open")}
                            onCheckedChange={() => toggleStatusFilter("open")}
                        >
                            Open
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={statusFilters.includes("closed")}
                            onCheckedChange={() => toggleStatusFilter("closed")}
                        >
                            Closed
                        </DropdownMenuCheckboxItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Work Mode</DropdownMenuLabel>
                        <DropdownMenuCheckboxItem
                            checked={workModeFilters.includes("onsite")}
                            onCheckedChange={() => toggleWorkModeFilter("onsite")}
                        >
                            Onsite
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={workModeFilters.includes("hybrid")}
                            onCheckedChange={() => toggleWorkModeFilter("hybrid")}
                        >
                            Hybrid
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={workModeFilters.includes("remote")}
                            onCheckedChange={() => toggleWorkModeFilter("remote")}
                        >
                            Remote
                        </DropdownMenuCheckboxItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Employment Type</DropdownMenuLabel>
                        <DropdownMenuCheckboxItem
                            checked={employmentTypeFilters.includes("full-time")}
                            onCheckedChange={() => toggleEmploymentTypeFilter("full-time")}
                        >
                            Full-time
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={employmentTypeFilters.includes("part-time")}
                            onCheckedChange={() => toggleEmploymentTypeFilter("part-time")}
                        >
                            Part-time
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={employmentTypeFilters.includes("contract")}
                            onCheckedChange={() => toggleEmploymentTypeFilter("contract")}
                        >
                            Contract
                        </DropdownMenuCheckboxItem>

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

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
