"use client"

import * as React from "react"
import Link from "next/link"
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import {
    Briefcase,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    ArrowUpRight,
    ArrowRight,
    Sparkles,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { DashboardStats } from "@/lib/actions/dashboard"

interface DashboardContentProps {
    stats: DashboardStats
}

const applicationChartConfig = {
    count: {
        label: "Applications",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig

const statusColors = {
    Pending: "hsl(45, 93%, 47%)",
    Accepted: "hsl(142, 76%, 36%)",
    Rejected: "hsl(0, 84%, 60%)",
}

const statusChartConfig = {
    Pending: { label: "Pending", color: statusColors.Pending },
    Accepted: { label: "Accepted", color: statusColors.Accepted },
    Rejected: { label: "Rejected", color: statusColors.Rejected },
} satisfies ChartConfig

export function DashboardContent({ stats }: DashboardContentProps) {
    const acceptanceRate = stats.totalApplications > 0
        ? Math.round((stats.acceptedApplications / stats.totalApplications) * 100)
        : 0

    return (
        <div className="min-h-screen pb-12">
            {/* Hero Header */}
            <div className="relative overflow-hidden border-b">
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <Badge variant="secondary" className="text-xs">Overview</Badge>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
                            <p className="text-muted-foreground max-w-lg">
                                Here's what's happening with your recruitment pipeline today.
                            </p>
                        </div>
                        <div className="hidden md:flex gap-3">
                            <Button variant="outline">
                                <Link href="/dashboard/jobs">View Jobs</Link>
                            </Button>
                            <Button>
                                <Link href="/dashboard/jobs/create">
                                    Post New Job
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Main Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Jobs */}
                    <Card className="shadow-none gap-0! group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Jobs
                                </CardTitle>
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <Briefcase className="h-4 w-4 text-blue-500" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{stats.totalJobs}</div>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                    {stats.openJobs} open
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {stats.closedJobs} closed
                                </span>
                            </div>
                        </CardContent>
                        <Link href="/dashboard/jobs" className="absolute inset-0" />
                    </Card>

                    {/* Total Applications */}
                    <Card className="shadow-none gap-0! group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-bl-full" />
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Applications
                                </CardTitle>
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <Users className="h-4 w-4 text-emerald-500" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{stats.totalApplications}</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Across all job postings
                            </p>
                        </CardContent>
                        <Link href="/dashboard/applications" className="absolute inset-0" />
                    </Card>

                    {/* Pending Review */}
                    <Card className="shadow-none gap-0! group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/20 to-transparent rounded-bl-full" />
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Pending Review
                                </CardTitle>
                                <div className="p-2 rounded-lg bg-amber-500/10">
                                    <Clock className="h-4 w-4 text-amber-500" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{stats.pendingApplications}</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Awaiting your decision
                            </p>
                        </CardContent>
                        <Link href="/dashboard/applications?status=pending" className="absolute inset-0" />
                    </Card>

                    {/* Acceptance Rate */}
                    <Card className="shadow-none gap-0! group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full" />
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Acceptance Rate
                                </CardTitle>
                                <div className="p-2 rounded-lg bg-green-500/10">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{acceptanceRate}%</div>
                            <div className="flex items-center gap-1 mt-2">
                                <ArrowUpRight className="h-3 w-3 text-green-500" />
                                <span className="text-xs text-green-600 font-medium">
                                    {stats.acceptedApplications} accepted
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions Row */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="shadow-none gap-2! border-green-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Accepted</CardTitle>
                            <CheckCircle className="h-5 w-5" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{stats.acceptedApplications}</div>
                            <p className="text-sm text-muted-foreground mt-1">candidates hired</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none gap-2! border-amber-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Pending</CardTitle>
                            <Clock className="h-5 w-5" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{stats.pendingApplications}</div>
                            <p className="text-sm text-muted-foreground mt-1">awaiting review</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none gap-2! border-red-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Rejected</CardTitle>
                            <XCircle className="h-5 w-5" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{stats.rejectedApplications}</div>
                            <p className="text-sm text-muted-foreground mt-1">not selected</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid gap-6 lg:grid-cols-7">
                    {/* Applications Trend - Takes 4 columns */}
                    <Card className="shadow-none lg:col-span-4 gap-2!">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Applications Trend</CardTitle>
                                    <CardDescription>
                                        Application volume over the last 6 months
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/dashboard/applications">
                                        View all
                                        <ArrowRight className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {stats.recentApplications.some(a => a.count > 0) ? (
                                <ChartContainer config={applicationChartConfig} className="h-[280px] w-full">
                                    <AreaChart data={stats.recentApplications} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            className="text-xs"
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            allowDecimals={false}
                                            className="text-xs"
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            fill="url(#fillCount)"
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground">
                                    <Users className="h-12 w-12 mb-4 opacity-20" />
                                    <p>No application data yet</p>
                                    <p className="text-sm">Applications will appear here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Status Distribution - Takes 3 columns */}
                    <Card className="shadow-none lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Status Breakdown</CardTitle>
                            <CardDescription>
                                Application status distribution
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stats.applicationsByStatus.length > 0 ? (
                                <div className="space-y-6">
                                    <ChartContainer config={statusChartConfig} className="h-[180px]">
                                        <PieChart>
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Pie
                                                data={stats.applicationsByStatus}
                                                dataKey="count"
                                                nameKey="status"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                            >
                                                {stats.applicationsByStatus.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={statusColors[entry.status as keyof typeof statusColors]}
                                                    />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ChartContainer>
                                    {/* Legend */}
                                    <div className="flex justify-center gap-6">
                                        {stats.applicationsByStatus.map((entry) => (
                                            <div key={entry.status} className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: statusColors[entry.status as keyof typeof statusColors] }}
                                                />
                                                <span className="text-sm text-muted-foreground">
                                                    {entry.status} ({entry.count})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[240px] flex flex-col items-center justify-center text-muted-foreground">
                                    <PieChart className="h-12 w-12 mb-4 opacity-20" />
                                    <p>No status data yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
