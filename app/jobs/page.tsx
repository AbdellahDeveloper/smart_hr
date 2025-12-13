import { JobCard, type Job } from "@/components/job-card"
import { JobsFilter } from "@/components/jobs-filter"

const MOCK_JOBS: Job[] = [
    {
        id: "1",
        title: "Senior Frontend Engineer",
        company: "TechFlow Inc",
        logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg", // Using Netflix logo as placeholder per image
        location: "San Francisco, CA",
        type: "Full-time",
        salary: "$150k - $200k",
        description: "Join our team to build the next generation of developer tools. You'll work on challenging problems with a talented team.",
        tags: ["React", "TypeScript", "Next.js", "Tailwind CSS", "5+ years"],
        postedAt: "2d ago",
        applicants: 47,
        isRemote: true
    },
    {
        id: "2",
        title: "Product Designer",
        company: "Creative Studio",
        logo: "",
        location: "New York, NY",
        type: "Full-time",
        salary: "$120k - $160k",
        description: "We are looking for a creative Product Designer to join our design team. You will be responsible for designing user-centric interfaces.",
        tags: ["Figma", "UI/UX", "Prototyping", "Design System"],
        postedAt: "4h ago",
        applicants: 12,
        isRemote: false
    },
    {
        id: "3",
        title: "Backend Engineer",
        company: "DataSystems",
        logo: "",
        location: "Austin, TX",
        type: "Contract",
        salary: "$80 - $120 / hr",
        description: "Looking for an experienced Backend Engineer to help scale our infrastructure. Experience with Go and Kubernetes is a plus.",
        tags: ["Go", "Kubernetes", "PostgreSQL", "Microservices"],
        postedAt: "1d ago",
        applicants: 23,
        isRemote: true
    }
]

export default function JobsPage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Career Opportunities</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Discover your next career opportunity. Browse our open positions and find the perfect role that matches your skills, experience, and career goals.
                </p>
            </div>

            <JobsFilter />

            <div className="grid gap-4">
                {MOCK_JOBS.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
            </div>
        </div>
    )
}