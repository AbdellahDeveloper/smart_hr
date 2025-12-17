'use client'

import { motion } from 'framer-motion'
import React from 'react'

type TextEffectProps = {
    children: string
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
    className?: string
    preset?: 'fade-in-blur' | 'fade-in' | 'slide-up'
    per?: 'word' | 'char' | 'line'
    delay?: number
    speedSegment?: number
}

const presets = {
    'fade-in-blur': {
        hidden: { opacity: 0, filter: 'blur(8px)' },
        visible: { opacity: 1, filter: 'blur(0px)' },
    },
    'fade-in': {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },
    'slide-up': {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    },
}

const motionComponents = {
    h1: motion.h1,
    h2: motion.h2,
    h3: motion.h3,
    h4: motion.h4,
    h5: motion.h5,
    h6: motion.h6,
    p: motion.p,
    span: motion.span,
    div: motion.div,
}

export function TextEffect({
    children,
    as = 'p',
    className,
    preset = 'fade-in',
    per = 'word',
    delay = 0,
    speedSegment = 0.1,
}: TextEffectProps) {
    const MotionComponent = motionComponents[as]
    const variants = presets[preset]

    const segments = per === 'line'
        ? children.split('\n')
        : per === 'char'
            ? children.split('')
            : children.split(' ')

    return (
        <MotionComponent
            className={className}
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: {
                        staggerChildren: speedSegment * 0.1,
                        delayChildren: delay,
                    },
                },
            }}
        >
            {segments.map((segment, i) => (
                <motion.span
                    key={i}
                    variants={variants}
                    transition={{ duration: 0.5 }}
                    style={{ display: 'inline-block' }}
                >
                    {segment}
                    {per === 'word' && i < segments.length - 1 ? '\u00A0' : ''}
                </motion.span>
            ))}
        </MotionComponent>
    )
}
