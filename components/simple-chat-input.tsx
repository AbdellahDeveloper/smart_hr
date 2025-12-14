'use client';

import React, { useState, FormEvent, KeyboardEvent } from 'react';
import { ArrowUpIcon } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea } from './ui/input-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import { IconPlus } from '@tabler/icons-react';
import { Kbd } from './ui/kbd';

interface SimpleChatInputProps {
    onSend?: (message: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function SimpleChatInput({
    onSend,
    placeholder = "Type a message...",
    disabled = false
}: SimpleChatInputProps) {
    const [input, setInput] = useState('');

    const handleSubmit = (e?: FormEvent) => {
        e?.preventDefault();
        if (input.trim() && !disabled) {
            onSend?.(input);
            setInput('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="bottom-4 right-4 w-full z-50 bg-background rounded-2xl">
            <form onSubmit={handleSubmit}>
                <InputGroup>
                    <InputGroupTextarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                    />
                    <InputGroupAddon align="block-end" className='flex flex-row items-center gap-2 justify-end'>
                        <Kbd className="text-[10px] h-4 min-w-4 p-1">
                            ENTER
                        </Kbd>
                        <InputGroupButton
                            variant="default"
                            className="rounded-full gap-1.5"
                            size="icon-xs"
                            disabled={disabled || input.trim() === ''}
                            type='submit'
                        >
                            <ArrowUpIcon className="w-3.5 h-3.5" />
                            <span className="sr-only">Send</span>
                        </InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
            </form>
        </div>
    );
}
