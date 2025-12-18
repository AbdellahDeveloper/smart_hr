import { createUIMessageStreamResponse } from "ai";
import { toAISdkFormat } from "@mastra/ai-sdk";
import { mastra } from "@/src/mastra";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { RuntimeContext } from "@mastra/core/runtime-context";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

export async function POST(req: Request) {
    // Get user session
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { messages } = await req.json();

    // Fetch user profile for context
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            name: true,
            firstName: true,
            lastName: true,
            companyName: true,
        }
    });

    // Build user context message
    const firstName = user?.firstName || user?.name?.split(' ')[0] || "there";
    const companyName = user?.companyName || "the company";

    const systemContext = {
        role: "system" as const,
        content: `You are an HR assistant for ${firstName} at ${companyName}. 
All jobs and applications you retrieve belong to ${companyName}. 
When mentioning the company, always use "${companyName}".
Address the user as "${firstName}" when appropriate.`
    };

    // Pass userId to the agent via runtimeContext
    const runtimeContext = new RuntimeContext();
    runtimeContext.set("userId", session.user.id);

    // Get both agents
    const jobAgent = mastra.getAgent("jobAgent");
    const formatterAgent = mastra.getAgent("formatterAgent");

    // Step 1: Get data from jobAgent with user context
    const messagesWithContext = [systemContext, ...messages];
    const jobAgentResponse = await jobAgent.generate(messagesWithContext, { runtimeContext });

    // Extract the text content from jobAgent response
    const jobAgentText = jobAgentResponse.text || "";

    // Step 2: Pass jobAgent response to formatterAgent for formatting
    const formatterMessages = [
        systemContext,
        ...messages,
        { role: "assistant" as const, content: jobAgentText },
        { role: "user" as const, content: "Convert the job/application data above into the required XML format. Use <Job> tags for jobs and <Application> tags for applications." }
    ];

    // Stream the formatted response
    const stream = await formatterAgent.stream(formatterMessages);

    return createUIMessageStreamResponse({
        stream: toAISdkFormat(stream, { from: "agent" }),
    });
}
