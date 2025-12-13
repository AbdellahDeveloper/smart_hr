import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bookmark, Briefcase, Clock, DollarSign, MapPin, Users } from "lucide-react"

export interface Job {
    id: string
    title: string
    company: string
    logo: string
    location: string
    type: string
    salary: string
    description: string
    tags: string[]
    postedAt: string
    applicants: number
    isRemote?: boolean
}

interface JobCardProps {
    job: Job
}

export function JobCard({ job }: JobCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <Avatar className="h-12 w-12 rounded-lg border-none">
                            <AvatarImage src={job.logo} alt={job.company} className="object-cover" />
                            <AvatarFallback className="rounded-lg bg-muted text-muted-foreground">
                                {job.company.substring(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-lg font-semibold leading-none mb-1.5">{job.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{job.company}</p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    <span>{job.location}</span>
                                </div>
                                {job.isRemote && (
                                    <Badge variant="secondary" className="font-normal text-muted-foreground bg-muted hover:bg-muted/80">
                                        Remote
                                    </Badge>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <DollarSign className="h-4 w-4" />
                                    <span>{job.salary}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Briefcase className="h-4 w-4" />
                                    <span>{job.type}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                        <Bookmark className="h-4 w-4" />
                        <span className="sr-only">Save job</span>
                    </Button>
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {job.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                    {job.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="rounded-full font-normal">
                            {tag}
                        </Badge>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>{job.postedAt}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            <span>{job.applicants} applicants</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">View Details</Button>
                        <Button>Quick Apply</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
