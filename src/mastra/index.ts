
import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { jobAgent } from './agents/job-agent';
import { formatterAgent } from './agents/formatter-agent';


export const mastra = new Mastra({
  agents: { jobAgent, formatterAgent },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
});
