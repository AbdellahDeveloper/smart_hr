
import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { jobAgent } from './agents/job-agent';


export const mastra = new Mastra({
  agents: { jobAgent },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
});
