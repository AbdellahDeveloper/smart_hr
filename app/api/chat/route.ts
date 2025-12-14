import { createUIMessageStreamResponse } from "ai";
import { toAISdkFormat } from "@mastra/ai-sdk";
import { mastra } from "@/src/mastra";

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const agent = mastra.getAgent("jobAgent");

    const stream = await agent.stream(messages);

    return createUIMessageStreamResponse({
        stream: toAISdkFormat(stream, { from: "agent" }),
    });
}
