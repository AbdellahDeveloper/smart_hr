import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const getJobsTool = createTool({
  id: 'getJobs',
  description: 'Get all available job postings or filter by specific criteria like status, work mode, or employment type',
  inputSchema: z.object({
    status: z.enum(['open', 'closed', 'all']).optional().describe('Filter jobs by status'),
    workMode: z.enum(['remote', 'onsite', 'hybrid', 'all']).optional().describe('Filter jobs by work mode'),
    employmentType: z.enum(['full-time', 'part-time', 'contract', 'all']).optional().describe('Filter jobs by employment type'),
  }),
  execute: async ({ context, runtimeContext }) => {
    const userId = runtimeContext?.get('userId') as string | undefined;

    if (!userId) {
      return { error: 'User not authenticated' };
    }

    const { status, workMode, employmentType } = context;

    try {
      const jobs = await prisma.job.findMany({
        where: {
          userId,
          ...(status && status !== 'all' && { status }),
          ...(workMode && workMode !== 'all' && { workMode }),
          ...(employmentType && employmentType !== 'all' && { employmentType }),
        },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { applications: true }
          }
        }
      });

      return {
        jobs: jobs.map(job => ({
          id: job.id,
          position: job.position,
          company: job.company,
          logo: job.logo,
          location: job.location,
          employmentType: job.employmentType,
          workMode: job.workMode,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          salaryCurrency: job.salaryCurrency,
          status: job.status,
          tags: job.tags,
          applicants: job._count.applications,
          createdAt: job.createdAt,
        })),
        count: jobs.length
      };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return { error: 'Failed to fetch jobs' };
    }
  },
});

export const getJobByIdTool = createTool({
  id: 'getJobById',
  description: 'Get detailed information about a specific job by its ID',
  inputSchema: z.object({
    jobId: z.string().describe('The ID of the job to retrieve'),
  }),
  execute: async ({ context, runtimeContext }) => {
    const userId = runtimeContext?.get('userId') as string | undefined;

    if (!userId) {
      return { error: 'User not authenticated' };
    }

    const { jobId } = context;

    try {
      const job = await prisma.job.findFirst({
        where: { id: jobId, userId },
        include: {
          _count: {
            select: { applications: true }
          }
        }
      });

      if (!job) {
        return { error: 'Job not found' };
      }

      return {
        job: {
          id: job.id,
          position: job.position,
          company: job.company,
          logo: job.logo,
          location: job.location,
          employmentType: job.employmentType,
          workMode: job.workMode,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          salaryCurrency: job.salaryCurrency,
          status: job.status,
          description: job.description,
          tags: job.tags,
          applicants: job._count.applications,
          createdAt: job.createdAt,
        }
      };
    } catch (error) {
      console.error('Error fetching job:', error);
      return { error: 'Failed to fetch job' };
    }
  },
});

export const getApplicationsTool = createTool({
  id: 'getApplications',
  description: 'Get job applications, optionally filtered by job ID or status',
  inputSchema: z.object({
    jobId: z.string().optional().describe('Filter applications by job ID'),
    status: z.enum(['pending', 'accepted', 'rejected', 'all']).optional().describe('Filter applications by status'),
  }),
  execute: async ({ context, runtimeContext }) => {
    const userId = runtimeContext?.get('userId') as string | undefined;

    if (!userId) {
      return { error: 'User not authenticated' };
    }

    const { jobId, status } = context;

    try {
      const applications = await prisma.application.findMany({
        where: {
          job: { userId },
          ...(jobId && { jobId }),
          ...(status && status !== 'all' && { status }),
        },
        include: {
          job: {
            select: {
              id: true,
              position: true,
              company: true,
              location: true,
              workMode: true,
            }
          }
        },
        orderBy: { appliedAt: 'desc' }
      });

      return {
        applications: applications.map(app => ({
          id: app.id,
          fullName: app.fullName,
          email: app.email,
          phone: app.phone,
          experience: app.experience,
          location: app.location,
          status: app.status,
          appliedAt: app.appliedAt,
          jobId: app.jobId,
          jobName: app.job.position,
          jobCompany: app.job.company,
        })),
        count: applications.length
      };
    } catch (error) {
      console.error('Error fetching applications:', error);
      return { error: 'Failed to fetch applications' };
    }
  },
});

export const getApplicationByIdTool = createTool({
  id: 'getApplicationById',
  description: 'Get detailed information about a specific application by its ID',
  inputSchema: z.object({
    applicationId: z.string().describe('The ID of the application to retrieve'),
  }),
  execute: async ({ context, runtimeContext }) => {
    const userId = runtimeContext?.get('userId') as string | undefined;

    if (!userId) {
      return { error: 'User not authenticated' };
    }

    const { applicationId } = context;

    try {
      const application = await prisma.application.findFirst({
        where: {
          id: applicationId,
          job: { userId }
        },
        include: {
          job: {
            select: {
              id: true,
              position: true,
              company: true,
              location: true,
              workMode: true,
              description: true,
              tags: true,
            }
          }
        }
      });

      if (!application) {
        return { error: 'Application not found' };
      }

      return {
        application: {
          id: application.id,
          fullName: application.fullName,
          email: application.email,
          phone: application.phone,
          experience: application.experience,
          location: application.location,
          status: application.status,
          coverLetter: application.coverLetter,
          cvUrl: application.cvUrl,
          appliedAt: application.appliedAt,
          job: application.job,
        }
      };
    } catch (error) {
      console.error('Error fetching application:', error);
      return { error: 'Failed to fetch application' };
    }
  },
});

export const getJobStatsTool = createTool({
  id: 'getJobStats',
  description: 'Get statistics about jobs and applications',
  inputSchema: z.object({}),
  execute: async ({ runtimeContext }) => {
    const userId = runtimeContext?.get('userId') as string | undefined;

    if (!userId) {
      return { error: 'User not authenticated' };
    }

    try {
      // Get job statistics
      const jobs = await prisma.job.findMany({
        where: { userId },
        select: { status: true }
      });

      const totalJobs = jobs.length;
      const openJobs = jobs.filter(j => j.status === 'open').length;
      const closedJobs = jobs.filter(j => j.status === 'closed').length;

      // Get application statistics
      const applications = await prisma.application.findMany({
        where: { job: { userId } },
        select: { status: true }
      });

      const totalApplications = applications.length;
      const pendingApplications = applications.filter(a => a.status === 'pending').length;
      const acceptedApplications = applications.filter(a => a.status === 'accepted').length;
      const rejectedApplications = applications.filter(a => a.status === 'rejected').length;

      return {
        jobs: {
          total: totalJobs,
          open: openJobs,
          closed: closedJobs,
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          accepted: acceptedApplications,
          rejected: rejectedApplications,
        },
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { error: 'Failed to fetch statistics' };
    }
  },
});

export const getBestApplicationsTool = createTool({
  id: 'getBestApplications',
  description: 'Get the best/top applications for a specific job, ranked by experience, location match, and qualifications. Returns the top 5 most suitable candidates.',
  inputSchema: z.object({
    jobId: z.string().describe('The ID of the job to get best applications for'),
    limit: z.number().optional().default(5).describe('Maximum number of top applications to return (default: 5)'),
  }),
  execute: async ({ context, runtimeContext }) => {
    const userId = runtimeContext?.get('userId') as string | undefined;

    if (!userId) {
      return { error: 'User not authenticated' };
    }

    const { jobId, limit = 5 } = context;

    try {
      // Get the job details (verify ownership)
      const job = await prisma.job.findFirst({
        where: { id: jobId, userId }
      });

      if (!job) {
        return { error: 'Job not found' };
      }

      // Get all applications for this job
      const applications = await prisma.application.findMany({
        where: { jobId },
        orderBy: { appliedAt: 'desc' }
      });

      if (applications.length === 0) {
        return {
          job: {
            id: job.id,
            position: job.position,
            company: job.company,
            location: job.location,
            workMode: job.workMode,
          },
          applications: [],
          count: 0,
          message: 'No applications found for this job'
        };
      }

      // Score and rank applications
      const scoredApplications = applications.map(app => {
        let score = 0;

        // Experience scoring (higher experience = higher score)
        const experienceYears = parseInt(app.experience?.split(' ')[0] || '0');
        score += experienceYears * 10; // 10 points per year of experience

        // Location match scoring
        if (app.location && job.location) {
          // Exact city match
          if (app.location.toLowerCase().includes(job.location.toLowerCase().split(',')[0])) {
            score += 50;
          }
          // Remote compatibility
          if (job.workMode === 'remote' || app.location.toLowerCase().includes('remote')) {
            score += 30;
          }
        }

        // Status bonus (accepted applications are clearly good candidates)
        if (app.status === 'accepted') {
          score += 100;
        } else if (app.status === 'pending') {
          score += 20; // Under consideration
        }

        // Recent application bonus (more recent = more interested)
        const daysAgo = Math.floor(
          (new Date().getTime() - new Date(app.appliedAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysAgo <= 7) {
          score += 15; // Applied within last week
        }

        return {
          id: app.id,
          fullName: app.fullName,
          email: app.email,
          phone: app.phone,
          experience: app.experience,
          location: app.location,
          status: app.status,
          appliedAt: app.appliedAt,
          matchScore: score
        };
      });

      // Sort by score (highest first) and limit results
      const topApplications = scoredApplications
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

      return {
        job: {
          id: job.id,
          position: job.position,
          company: job.company,
          location: job.location,
          workMode: job.workMode,
        },
        applications: topApplications,
        count: topApplications.length,
        totalApplications: applications.length,
      };
    } catch (error) {
      console.error('Error fetching best applications:', error);
      return { error: 'Failed to fetch best applications' };
    }
  },
});
