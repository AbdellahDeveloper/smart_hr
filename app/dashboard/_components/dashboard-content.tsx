"use client"

import * as React from "react"
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid } from "recharts"
import {
    Briefcase,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { DashboardStats } from "@/lib/actions/dashboard"

interface DashboardContentProps {
    stats: DashboardStats
}

const applicationChartConfig = {
    count: {
        label: "Applications",
        color: "hsl(var(--chart-1))",
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
    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Welcome back! Here&apos;s your HR overview.
                    </p>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Jobs
                            </CardTitle>
                            <Briefcase className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalJobs}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.openJobs} open, {stats.closedJobs} closed
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Applications
                            </CardTitle>
                            <Users className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalApplications}</div>
                            <p className="text-xs text-muted-foreground">
                                From all job postings
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pending Review
                            </CardTitle>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting decision
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Acceptance Rate
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.totalApplications > 0
                                    ? Math.round((stats.acceptedApplications / stats.totalApplications) * 100)
                                    : 0}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.acceptedApplications} accepted
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Applications Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Applications Trend</CardTitle>
                            <CardDescription>
                                Number of applications received over the last 6 months
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stats.recentApplications.some(a => a.count > 0) ? (
                                <ChartContainer config={applicationChartConfig} className="h-[250px]">
                                    <BarChart data={stats.recentApplications} margin={{ left: 0, right: 0 }}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            allowDecimals={false}
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar
                                            dataKey="count"
                                            fill="var(--color-count)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                                    No application data yet
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Application Status Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Status</CardTitle>
                            <CardDescription>
                                Distribution of applications by current status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stats.applicationsByStatus.length > 0 ? (
                                <ChartContainer config={statusChartConfig} className="h-[250px]">
                                    <PieChart>
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Pie
                                            data={stats.applicationsByStatus}
                                            dataKey="count"
                                            nameKey="status"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label={({ status, count }) => `${status}: ${count}`}
                                            labelLine={false}
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
                            ) : (
                                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                                    No application data yet
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Stats Row */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.acceptedApplications}</div>
                            <p className="text-xs text-muted-foreground">candidates accepted</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{stats.pendingApplications}</div>
                            <p className="text-xs text-muted-foreground">awaiting review</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.rejectedApplications}</div>
                            <p className="text-xs text-muted-foreground">not selected</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
