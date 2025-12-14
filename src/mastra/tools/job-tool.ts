import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import jobsData from '../../../app/dashboard/data.json';
import applicationsData from '../../../app/dashboard/applications/applications-data.json';

export const getJobsTool = createTool({
  id: 'getJobs',
  description: 'Get all available job postings or filter by specific criteria like status, work mode, or employment type',
  inputSchema: z.object({
    status: z.enum(['open', 'closed', 'all']).optional().describe('Filter jobs by status'),
    workMode: z.enum(['remote', 'onsite', 'hybrid', 'all']).optional().describe('Filter jobs by work mode'),
    employmentType: z.enum(['full-time', 'part-time', 'contract', 'all']).optional().describe('Filter jobs by employment type'),
  }),
  execute: async ({ context }: { context: { status?: 'open' | 'closed' | 'all'; workMode?: 'remote' | 'onsite' | 'hybrid' | 'all'; employmentType?: 'full-time' | 'part-time' | 'contract' | 'all' } }) => {
    const { status, workMode, employmentType } = context;

    let filteredJobs = [...jobsData];

    if (status && status !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.status === status);
    }

    if (workMode && workMode !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.workMode === workMode);
    }

    if (employmentType && employmentType !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.employmentType === employmentType);
    }

    return {
      jobs: filteredJobs,
      count: filteredJobs.length
    };
  },
});

export const getJobByIdTool = createTool({
  id: 'getJobById',
  description: 'Get detailed information about a specific job by its ID',
  inputSchema: z.object({
    jobId: z.string().describe('The ID of the job to retrieve'),
  }),
  execute: async ({ context }: { context: { jobId: string } }) => {
    const { jobId } = context;
    const job = jobsData.find(j => j.id === jobId);

    if (!job) {
      return { error: 'Job not found' };
    }

    return { job };
  },
});

export const getApplicationsTool = createTool({
  id: 'getApplications',
  description: 'Get job applications, optionally filtered by job ID or status',
  inputSchema: z.object({
    jobId: z.string().optional().describe('Filter applications by job ID'),
    status: z.enum(['pending', 'accepted', 'rejected', 'all']).optional().describe('Filter applications by status'),
  }),
  execute: async ({ context }: { context: { jobId?: string; status?: 'pending' | 'accepted' | 'rejected' | 'all' } }) => {
    const { jobId, status } = context;

    let filteredApplications = [...applicationsData];

    if (jobId) {
      filteredApplications = filteredApplications.filter(app => app.jobId === jobId);
    }

    if (status && status !== 'all') {
      filteredApplications = filteredApplications.filter(app => app.status === status);
    }

    return {
      applications: filteredApplications,
      count: filteredApplications.length
    };
  },
});

export const getApplicationByIdTool = createTool({
  id: 'getApplicationById',
  description: 'Get detailed information about a specific application by its ID',
  inputSchema: z.object({
    applicationId: z.string().describe('The ID of the application to retrieve'),
  }),
  execute: async ({ context }: { context: { applicationId: string } }) => {
    const { applicationId } = context;
    const application = applicationsData.find(app => app.id === applicationId);

    if (!application) {
      return { error: 'Application not found' };
    }

    return { application };
  },
});

export const getJobStatsTool = createTool({
  id: 'getJobStats',
  description: 'Get statistics about jobs and applications',
  inputSchema: z.object({}),
  execute: async () => {
    const totalJobs = jobsData.length;
    const openJobs = jobsData.filter(j => j.status === 'open').length;
    const closedJobs = jobsData.filter(j => j.status === 'closed').length;

    const totalApplications = applicationsData.length;
    const pendingApplications = applicationsData.filter(a => a.status === 'pending').length;
    const acceptedApplications = applicationsData.filter(a => a.status === 'accepted').length;
    const rejectedApplications = applicationsData.filter(a => a.status === 'rejected').length;

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
  },
});

export const getBestApplicationsTool = createTool({
  id: 'getBestApplications',
  description: 'Get the best/top applications for a specific job, ranked by experience, location match, and qualifications. Returns the top 5 most suitable candidates.',
  inputSchema: z.object({
    jobId: z.string().describe('The ID of the job to get best applications for'),
    limit: z.number().optional().default(5).describe('Maximum number of top applications to return (default: 5)'),
  }),
  execute: async ({ context }: { context: { jobId: string; limit?: number } }) => {
    const { jobId, limit = 5 } = context;

    // Get the job details
    const job = jobsData.find(j => j.id === jobId);

    if (!job) {
      return { error: 'Job not found' };
    }

    // Get all applications for this job
    const jobApplications = applicationsData.filter(app => app.jobId === jobId);

    if (jobApplications.length === 0) {
      return {
        job,
        applications: [],
        count: 0,
        message: 'No applications found for this job'
      };
    }

    // Score and rank applications
    const scoredApplications = jobApplications.map(app => {
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
        ...app,
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
      totalApplications: jobApplications.length,
    };
  },
});
