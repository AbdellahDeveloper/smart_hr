import { createUIMessageStreamResponse } from "ai";
import { toAISdkFormat } from "@mastra/ai-sdk";
import { mastra } from "@/src/mastra";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { RuntimeContext } from "@mastra/core/runtime-context";

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

    // Pass userId to the agent via runtimeContext
    const runtimeContext = new RuntimeContext();
    runtimeContext.set("userId", session.user.id);

    // Get both agents
    const jobAgent = mastra.getAgent("jobAgent");
    const formatterAgent = mastra.getAgent("formatterAgent");

    // Step 1: Get data from jobAgent (non-streaming to get complete response)
    const jobAgentResponse = await jobAgent.generate(messages, { runtimeContext });

    // Extract the text content from jobAgent response
    const jobAgentText = jobAgentResponse.text || "";

    // Step 2: Pass jobAgent response to formatterAgent for formatting
    const formatterMessages = [
        ...messages,
        { role: "assistant" as const, content: jobAgentText },
        { role: "user" as const, content: "Format the above HR data using the proper XML card formats for display." }
    ];

    // Stream the formatted response
    const stream = await formatterAgent.stream(formatterMessages);

    return createUIMessageStreamResponse({
        stream: toAISdkFormat(stream, { from: "agent" }),
    });
}
