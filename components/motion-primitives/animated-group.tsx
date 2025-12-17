'use client'

import { motion } from 'framer-motion'
import React from 'react'

type AnimatedGroupProps = {
    children: React.ReactNode
    className?: string
    staggerDelay?: number
    initialDelay?: number
}

export function AnimatedGroup({
    children,
    className,
    staggerDelay = 0.1,
    initialDelay = 0.2,
}: AnimatedGroupProps) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay,
                        delayChildren: initialDelay,
                    },
                },
            }}
        >
            {React.Children.map(children, (child, index) => (
                <motion.div
                    key={index}
                    variants={{
                        hidden: { opacity: 0, filter: 'blur(12px)', y: 12 },
                        visible: {
                            opacity: 1,
                            filter: 'blur(0px)',
                            y: 0,
                            transition: {
                                type: 'spring',
                                bounce: 0.3,
                                duration: 1.5,
                            },
                        },
                    }}
                >
                    {child}
                </motion.div>
            ))}
        </motion.div>
    )
}
