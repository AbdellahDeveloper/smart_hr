'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextEffect } from '@/components/motion-primitives/text-effect'
import { AnimatedGroup } from '@/components/motion-primitives/animated-group'

export default function HeroSection() {
    return (
        <main className="overflow-hidden relative min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
            {/* Animated background elements */}
            <div aria-hidden className="absolute inset-0 isolate overflow-hidden">
                {/* Gradient orbs */}
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            <section className="relative">
                <div className="relative pt-20 pb-10">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">

                            {/* Main headline */}
                            <TextEffect
                                preset="fade-in-blur"
                                speedSegment={0.3}
                                as="h1"
                                className="mx-auto mt-8 max-w-5xl text-balance text-5xl font-bold tracking-tight max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem] bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text">
                                Transform Your Hiring with Smart AI Automation
                            </TextEffect>

                            {/* Subtitle */}
                            <TextEffect
                                per="line"
                                preset="fade-in-blur"
                                speedSegment={0.3}
                                delay={0.5}
                                as="p"
                                className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
                                Streamline recruitment, automate candidate screening, and make data-driven hiring decisions with our intelligent HR management platform.
                            </TextEffect>

                            {/* CTA buttons */}
                            <AnimatedGroup staggerDelay={0.05} initialDelay={0.75} className="mt-12 flex flex-col items-center justify-center gap-4 md:flex-row">
                                <div className="bg-primary/10 rounded-[calc(var(--radius-xl)+0.125rem)] border border-primary/20 p-0.5">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="rounded-xl px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
                                        <Link href="/auth/register">
                                            <span className="text-nowrap">Get Started Free</span>
                                            <ArrowRight className="ml-2 size-4" />
                                        </Link>
                                    </Button>
                                </div>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="rounded-xl px-8 text-base font-semibold transition-all duration-300 hover:bg-muted">
                                    <Link href="/jobs">
                                        <span className="text-nowrap">Browse Jobs</span>
                                    </Link>
                                </Button>
                            </AnimatedGroup>
                        </div>
                    </div>
                </div>

                {/* Hero Image with 3D perspective effect */}
                <div className="mx-auto 2xl:max-w-7xl">
                    <div className="perspective-distant pl-8 lg:pl-44">
                        <div className="lg:h-176 rotate-x-20 mask-b-from-55% mask-b-to-100% mask-r-from-75% skew-x-12 pl-6 pt-6">
                            <Image
                                className="rounded-(--radius) border shadow-xl dark:hidden"
                                src="/assets/images/hero-light.png"
                                alt="Smart HR Dashboard"
                                width={2880}
                                height={2074}
                            />
                            <Image
                                className="rounded-(--radius) hidden border shadow-xl dark:block"
                                src="/assets/images/hero-dark.png"
                                alt="Smart HR Dashboard"
                                width={2880}
                                height={2074}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
