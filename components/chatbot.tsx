'use client';

import React from 'react';
import { useChat } from '@ai-sdk/react';
import { Bot, User, Loader2 } from 'lucide-react';
import { useEffect, useRef, ReactNode, useMemo, useDeferredValue, useCallback, useState, useTransition } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ApplicationCard } from '@/app/testai/components/ApplicationCard';
import { JobCard } from '@/app/testai/components/JobCard';
import { SimpleChatInput } from './simple-chat-input';
import { ScrollArea } from './ui/scroll-area';

// Pre-compiled regex patterns (moved outside component for performance)
const APPLICATION_REGEX = /<Application><FullName>(.*?)<\/FullName><Email>(.*?)<\/Email><Phone>(.*?)<\/Phone><JobName>(.*?)<\/JobName><Status>(.*?)<\/Status><Experience>(.*?)<\/Experience><Location>(.*?)<\/Location><AppliedAt>(.*?)<\/AppliedAt><\/Application>/g;
const JOB_REGEX = /<Job><Position>(.*?)<\/Position><Company>(.*?)<\/Company><Location>(.*?)<\/Location><EmploymentType>(.*?)<\/EmploymentType><WorkMode>(.*?)<\/WorkMode><SalaryMin>(.*?)<\/SalaryMin><SalaryMax>(.*?)<\/SalaryMax><Status>(.*?)<\/Status><Applicants>(.*?)<\/Applicants><PostedAt>(.*?)<\/PostedAt><\/Job>/g;

// Simple streaming text component - lightweight, no parsing
const StreamingText = React.memo(({ text }: { text: string }) => {
    return <span className="whitespace-pre-wrap">{text}</span>;
});
StreamingText.displayName = 'StreamingText';

// Memoized component to parse and render message content (only used for complete messages)
const MessageContent = React.memo(({ text, isStreaming = false }: { text: string; isStreaming?: boolean }) => {
    // During streaming, just show plain text to avoid expensive parsing
    if (isStreaming) {
        return <StreamingText text={text} />;
    }

    const parsedContent = useMemo(() => {
        // Reset regex indices
        APPLICATION_REGEX.lastIndex = 0;
        JOB_REGEX.lastIndex = 0;

        const parts: ReactNode[] = [];
        let lastIndex = 0;
        let key = 0;

        // Find all card matches (both Applications and Jobs)
        const cardMatches: Array<{ type: 'application' | 'job', index: number, match: RegExpExecArray }> = [];

        let match;
        while ((match = APPLICATION_REGEX.exec(text)) !== null) {
            cardMatches.push({ type: 'application', index: match.index, match });
        }
        while ((match = JOB_REGEX.exec(text)) !== null) {
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

MessageContent.displayName = 'MessageContent';

export function Chatbot() {
    const { messages, sendMessage, status } = useChat();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    // Handle scroll to show/hide the scroll-to-bottom button
    const handleScroll = useCallback(() => {
        if (scrollAreaRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
            // Show button if user scrolled up more than 100px from bottom
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            setShowScrollButton(!isNearBottom);
        }
    }, []);

    // Add scroll event listener
    useEffect(() => {
        const scrollElement = scrollAreaRef.current;
        if (scrollElement) {
            scrollElement.addEventListener('scroll', handleScroll);
            return () => scrollElement.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    const handleSendMessage = (message: string) => {
        if (status !== 'streaming' && status !== 'submitted') {
            sendMessage({
                role: 'user',
                parts: [{ type: 'text', text: message }],
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col h-full relative">
            {/* Scroll to bottom button */}
            {showScrollButton && (
                <button
                    onClick={scrollToBottom}
                    className="absolute bottom-34 cursor-pointer right-4 z-10 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                    aria-label="Scroll to bottom"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                </button>
            )}
            <div ref={scrollAreaRef} className='flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto p-4 space-y-4'>
                {/* Messages Container */}
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Bot className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                            Start a Conversation
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Ask me about jobs, applications, or candidates!
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message, messageIndex) => {
                            // Determine if this message is currently streaming
                            const isLastMessage = messageIndex === messages.length - 1;
                            const isAssistantMessage = message.role === 'assistant';
                            const isCurrentlyStreaming = isLastMessage && isAssistantMessage && (status === 'streaming' || status === 'submitted');

                            return (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar - only show for user messages */}
                                    {message.role === 'user' && (
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border bg-muted border-border">
                                            <User className="w-4 h-4 text-foreground" />
                                        </div>
                                    )}

                                    {/* Message Bubble */}
                                    <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        <div
                                            className={`inline-block px-0 py-2 rounded-lg text-sm ${message.role === 'user'
                                                ? 'bg-muted border border-border text-foreground px-4'
                                                : 'text-foreground'
                                                }`}
                                        >
                                            <div className="whitespace-pre-wrap break-words">
                                                {message.parts.map((part, index) => {
                                                    if (part.type === 'text') {
                                                        return <MessageContent key={index} text={part.text} isStreaming={isCurrentlyStreaming} />;
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {/* Thinking indicator when waiting for response */}
                        {status === 'submitted' && (
                            <div className="flex gap-3">
                                <div className="flex-1 text-left">
                                    <div className="inline-block py-2 rounded-lg text-sm text-muted-foreground italic">
                                        Thinking...
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className='w-full py-4 px-2'>
                {/* Input Area - Bottom Right */}
                <SimpleChatInput
                    onSend={handleSendMessage}
                    placeholder="Ask about jobs, candidates..."
                    disabled={status === 'streaming' || status === 'submitted'}
                />
            </div>
        </div>
    );
}
