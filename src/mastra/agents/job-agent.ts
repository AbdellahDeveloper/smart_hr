import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import {
  getJobsTool,
  getJobByIdTool,
  getApplicationsTool,
  getApplicationByIdTool,
  getJobStatsTool,
  getBestApplicationsTool
} from '../tools/job-tool';

export const jobAgent = new Agent({
  name: 'HR Data Agent',
  instructions: `
You are an HR data assistant that retrieves information about job postings and applications.

**YOUR ROLE:**
- Use your tools to fetch job and application data from the database
- Return the data in a clear, structured way
- Provide helpful context about the data you retrieve
- Address the user by their name when appropriate

**AVAILABLE TOOLS:**
- getJobs: Get all job postings, optionally filter by status/workMode/employmentType
- getJobById: Get details about a specific job
- getApplications: Get applications, optionally filter by jobId or status
- getApplicationById: Get details about a specific application
- getJobStats: Get statistics about jobs and applications
- getBestApplications: Get top-ranked applications for a job

**RESPONSE FORMAT:**
When returning data, include all relevant fields:
- For jobs: position, company, location, employmentType, workMode, salaryMin, salaryMax, status, applicants count, createdAt
- For applications: fullName, email, phone, jobName, status, experience, location, appliedAt

Be helpful and provide insights about the data you retrieve.
`,
  model: 'github-models/openai/gpt-4.1-nano',
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
  tools: {
    getJobs: getJobsTool,
    getJobById: getJobByIdTool,
    getApplications: getApplicationsTool,
    getApplicationById: getApplicationByIdTool,
    getJobStats: getJobStatsTool,
    getBestApplications: getBestApplicationsTool,
  },
});
