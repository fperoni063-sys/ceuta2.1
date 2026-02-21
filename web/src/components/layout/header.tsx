'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Container } from "./container"
import { Button } from "../ui/button"
import { Menu, X } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const NAV_LINKS = [
    { href: "/cursos", label: "Cursos" },
    { href: "https://www.ceuta.org.uy/que-es-ceuta", label: "Qué es Ceuta?" },
    { href: "/calendario", label: "Calendario" },
    { href: "/contacto", label: "Contacto" },
]

export function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <header className="sticky top-0 z-50 w-full border-b border-earth-900/10 bg-background/80 backdrop-blur-md">
            <Container>
                <div className="flex h-20 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/ceuta-logo.png"
                            alt="CEUTA Logo"
                            width={48}
                            height={48}
                            className="object-contain"
                        />
                        <span className="font-heading text-2xl font-bold text-earth-900 dark:text-foreground tracking-tight">
                            CEUTA
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-earth-900 dark:text-foreground hover:text-green-700 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <Button variant="default" asChild>
                            <Link href="/cursos">Ver Cursos</Link>
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    {mounted && (
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                                <button className="md:hidden p-2 text-earth-900 dark:text-foreground transition-colors hover:text-green-700">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Abrir menú</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[300px] h-full flex flex-col p-6 border-l rounded-none !left-auto !right-0 !translate-x-0 !top-0 !translate-y-0 duration-300">
                                <DialogHeader className="text-left mb-8">
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src="/ceuta-logo.png"
                                            alt="CEUTA Logo"
                                            width={36}
                                            height={36}
                                            className="object-contain"
                                        />
                                        <DialogTitle className="font-heading text-xl font-bold text-earth-900 dark:text-foreground tracking-tight">
                                            CEUTA
                                        </DialogTitle>
                                    </div>
                                </DialogHeader>

                                <nav className="flex flex-col gap-6">
                                    {NAV_LINKS.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className="text-lg font-medium text-earth-900 dark:text-foreground hover:text-green-700 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </nav>

                                <div className="mt-auto pt-8 border-t border-earth-900/10">
                                    <Button className="w-full" asChild onClick={() => setIsOpen(false)}>
                                        <Link href="/cursos">Ver Cursos</Link>
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </Container>
        </header>
    )
}
