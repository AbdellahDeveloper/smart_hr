'use client';

import React from 'react';
import { useChat } from '@ai-sdk/react';
import { Send, Bot, User } from 'lucide-react';
import { useEffect, useRef, useState, FormEvent, ReactNode, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ApplicationCard } from './components/ApplicationCard';
import { JobCard } from './components/JobCard';

interface ApplicationData {
    fullName: string;
    email: string;
    phone?: string;
    jobName: string;
    status: string;
    experience?: string;
    location?: string;
    appliedAt?: string;
}

interface JobData {
    position: string;
    company: string;
    location?: string;
    employmentType?: string;
    workMode?: string;
    salaryMin?: string;
    salaryMax?: string;
    status?: string;
    applicants?: string;
    postedAt?: string;
}

// Memoized component to parse and render message content
const MessageContent = React.memo(({ text }: { text: string }) => {
    const parsedContent = useMemo(() => {
        // Regex patterns for Application and Job cards
        const applicationRegex = /<Application><FullName>(.*?)<\/FullName><Email>(.*?)<\/Email><Phone>(.*?)<\/Phone><JobName>(.*?)<\/JobName><Status>(.*?)<\/Status><Experience>(.*?)<\/Experience><Location>(.*?)<\/Location><AppliedAt>(.*?)<\/AppliedAt><\/Application>/g;
        const jobRegex = /<Job><Position>(.*?)<\/Position><Company>(.*?)<\/Company><Location>(.*?)<\/Location><EmploymentType>(.*?)<\/EmploymentType><WorkMode>(.*?)<\/WorkMode><SalaryMin>(.*?)<\/SalaryMin><SalaryMax>(.*?)<\/SalaryMax><Status>(.*?)<\/Status><Applicants>(.*?)<\/Applicants><PostedAt>(.*?)<\/PostedAt><\/Job>/g;

        const parts: ReactNode[] = [];
        let lastIndex = 0;
        let key = 0;

        // Find all card matches (both Applications and Jobs)
        const cardMatches: Array<{ type: 'application' | 'job', index: number, match: RegExpExecArray }> = [];

        let match;
        while ((match = applicationRegex.exec(text)) !== null) {
            cardMatches.push({ type: 'application', index: match.index, match });
        }
        while ((match = jobRegex.exec(text)) !== null) {
            cardMatches.push({ type: 'job', index: match.index, match });
        }

        // Sort by index to maintain order
        cardMatches.sort((a, b) => a.index - b.index);

        // Process all matches in order
        cardMatches.forEach((cardMatch) => {
            const { type, index, match } = cardMatch;

            // Add text before the card with markdown support
            if (index > lastIndex) {
                const textBefore = text.substring(lastIndex, index);
                if (textBefore.trim()) {
                    parts.push(
                        <ReactMarkdown
                            key={`text-${key++}`}
                            remarkPlugins={[remarkGfm]}
                            components={{
                                p: ({ children }) => <span>{children}</span>,
                                h1: ({ children }) => <h1 className="text-2xl font-bold my-2">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-xl font-bold my-2">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-lg font-bold my-1">{children}</h3>,
                                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                ul: ({ children }) => <ul className="list-disc ml-4 my-2">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal ml-4 my-2">{children}</ol>,
                                code: ({ children }) => <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">{children}</code>,
                            }}
                        >
                            {textBefore}
                        </ReactMarkdown>
                    );
                }
            }

            // Add the appropriate card component
            if (type === 'application') {
                parts.push(
                    <ApplicationCard
                        key={`application-${key++}`}
                        fullName={match[1]}
                        email={match[2]}
                        phone={match[3]}
                        jobName={match[4]}
                        status={match[5]}
                        experience={match[6]}
                        location={match[7]}
                        appliedAt={match[8]}
                    />
                );
            } else if (type === 'job') {
                parts.push(
                    <JobCard
                        key={`job-${key++}`}
                        position={match[1]}
                        company={match[2]}
                        location={match[3]}
                        employmentType={match[4]}
                        workMode={match[5]}
                        salaryMin={match[6]}
                        salaryMax={match[7]}
                        status={match[8]}
                        applicants={match[9]}
                        postedAt={match[10]}
                    />
                );
            }

            // Update lastIndex to include the full match
            lastIndex = index + match[0].length;
        });

        // Add remaining text after the last card with markdown support
        if (lastIndex < text.length) {
            const textAfter = text.substring(lastIndex);
            if (textAfter.trim()) {
                parts.push(
                    <ReactMarkdown
                        key={`text-${key++}`}
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }) => <span>{children}</span>,
                            h1: ({ children }) => <h1 className="text-2xl font-bold my-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-xl font-bold my-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-lg font-bold my-1">{children}</h3>,
                            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            ul: ({ children }) => <ul className="list-disc ml-4 my-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal ml-4 my-2">{children}</ol>,
                            code: ({ children }) => <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">{children}</code>,
                        }}
                    >
                        {textAfter}
                    </ReactMarkdown>
                );
            }
        }

        // If no cards found, return the original text with markdown support
        return parts.length > 0 ? parts : [
            <ReactMarkdown
                key="text-0"
                remarkPlugins={[remarkGfm]}
                components={{
                    p: ({ children }) => <span>{children}</span>,
                    h1: ({ children }) => <h1 className="text-2xl font-bold my-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold my-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-bold my-1">{children}</h3>,
                    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    ul: ({ children }) => <ul className="list-disc ml-4 my-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-4 my-2">{children}</ol>,
                    code: ({ children }) => <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">{children}</code>,
                }}
            >
                {text}
            </ReactMarkdown>
        ];
    }, [text]);

    return <>{parsedContent}</>;
});

export default function TestAI() {
    const { messages, sendMessage, status } = useChat();

    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (input.trim() && status !== 'streaming' && status !== 'submitted') {
            sendMessage({
                role: 'user',
                parts: [{ type: 'text', text: input }],
            });
            setInput('');
        }
    };



    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            {/* Header */}
            <div className="border-b bg-background p-6 shadow-sm">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-foreground">
                        AI Chat Assistant
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Powered by Mastra AI
                    </p>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                <Bot className="w-10 h-10 text-primary" />
                            </div>
                            <h2 className="text-2xl font-semibold text-foreground mb-2">
                                Start a Conversation
                            </h2>
                            <p className="text-muted-foreground max-w-md">
                                Ask me anything! I'm here to help you with information, questions, and more.
                            </p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                    }`}
                            >
                                {/* Avatar */}
                                <div
                                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${message.role === 'user'
                                        ? 'bg-muted border-border'
                                        : 'bg-primary/10 border-primary/20'
                                        }`}
                                >
                                    {message.role === 'user' ? (
                                        <User className="w-5 h-5 text-foreground" />
                                    ) : (
                                        <Bot className="w-5 h-5 text-primary" />
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div
                                    className={`flex-1 max-w-2xl ${message.role === 'user' ? 'text-right' : 'text-left'
                                        }`}
                                >
                                    <div
                                        className={`inline-block px-6 py-3 rounded-lg border ${message.role === 'user'
                                            ? 'bg-muted border-border text-foreground'
                                            : 'bg-background border-border text-foreground'
                                            }`}
                                    >
                                        <div className="whitespace-pre-wrap break-words">
                                            {message.parts.map((part, index) => {
                                                if (part.type === 'text') {
                                                    return <MessageContent key={index} text={part.text} />;
                                                }
                                                return null;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}



                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t bg-background p-6 shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 px-6 py-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="px-6 py-4 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                        >
                            <Send className="w-5 h-5" />
                            <span className="hidden sm:inline">Send</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}