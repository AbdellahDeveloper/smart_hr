import 'dotenv/config'
import { defineConfig } from "@prisma/config";

// Force load env vars if needed, though dotenv/config matches user request
const dbUrl = process.env.DATABASE_URL;
const shadowDbUrl = process.env.DIRECT_URL;

export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: {
        url: dbUrl!,
        shadowDatabaseUrl: shadowDbUrl!,
    }
});