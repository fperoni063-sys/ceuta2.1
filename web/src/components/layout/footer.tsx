import Link from "next/link"
import Image from "next/image"
import { Container } from "./container"
import { Button } from "../ui/button"
import { MapPin, Phone, Mail, Facebook, Instagram } from "lucide-react"
import { COMPANY_INFO } from "@/lib/constants"

export function Footer() {
    return (
        <footer className="bg-earth-900 text-cream">
            <Container className="py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/ceuta-logo.png"
                                alt="CEUTA Logo"
                                width={48}
                                height={48}
                                className="rounded-lg"
                            />
                            <h3 className="font-heading text-2xl font-bold">CEUTA</h3>
                        </div>
                        <p className="text-cream/80 text-sm leading-relaxed">
                            Centro de Estudios Uruguayo de Tecnologías Apropiadas.
                            Promoviendo la sustentabilidad y el cuidado de la tierra desde 1985.
                        </p>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h4 className="font-heading text-lg font-semibold text-accent">Contacto</h4>
                        <ul className="space-y-3 text-sm text-cream/80">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 shrink-0 text-green-700" />
                                <span>{COMPANY_INFO.address}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 shrink-0 text-green-700" />
                                <span>{COMPANY_INFO.whatsapp.secretariaDisplay}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 shrink-0 text-green-700" />
                                <span>{COMPANY_INFO.email}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Links */}
                    <div className="space-y-4">
                        <h4 className="font-heading text-lg font-semibold text-accent">Enlaces</h4>
                        <ul className="space-y-2 text-sm text-cream/80">
                            <li>
                                <Link href="/cursos" className="hover:text-white transition-colors">
                                    Cursos Disponibles
                                </Link>
                            </li>
                            <li>
                                <Link href="https://www.ceuta.org.uy/que-es-ceuta" className="hover:text-white transition-colors">
                                    Qué es Ceuta?
                                </Link>
                            </li>
                            <li>
                                <Link href="/calendario" className="hover:text-white transition-colors">
                                    Calendario Anual
                                </Link>
                            </li>
                            <li>
                                <Link href="/politica-privacidad" className="hover:text-white transition-colors">
                                    Política de Privacidad
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter / Social */}
                    <div className="space-y-4">
                        <h4 className="font-heading text-lg font-semibold text-accent">Síguenos</h4>
                        <div className="flex gap-4">
                            <a
                                href="https://www.facebook.com/cursosceuta/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-cream/10 p-2 rounded-full hover:bg-green-700 transition-colors"
                            >
                                <Facebook className="h-5 w-5" />
                                <span className="sr-only">Facebook</span>
                            </a>
                            <a
                                href="https://www.instagram.com/ceuta.uy/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-cream/10 p-2 rounded-full hover:bg-green-700 transition-colors"
                            >
                                <Instagram className="h-5 w-5" />
                                <span className="sr-only">Instagram</span>
                            </a>
                        </div>

                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-8 border-t border-cream/10 text-center">
                    <p className="text-xs text-cream/60">
                        &copy; {new Date().getFullYear()} CEUTA. Todos los derechos reservados.
                    </p>
                </div>
            </Container>
        </footer>
    )
}
