export function Footer() {
    return (
        <footer className="bg-earth-900 text-white/80 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <h3 className="font-heading text-xl font-bold text-white mb-3">CEUTA Uruguay</h3>
                        <p className="text-sm text-white/60 leading-relaxed">
                            Centro Uruguayo de Tecnologías Apropiadas. Formación en permacultura, agroecología, bioconstrucción y más.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-medium text-white mb-3">Enlaces</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/cursos" className="hover:text-white transition-colors">Cursos</a></li>
                            <li><a href="/politica-privacidad" className="hover:text-white transition-colors">Política de Privacidad</a></li>
                            <li><a href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
                            <li><a href="/politica-entrega" className="hover:text-white transition-colors">Política de Entrega</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-medium text-white mb-3">Contacto</h4>
                        <ul className="space-y-2 text-sm">
                            <li>📧 info@ceuta.org.uy</li>
                            <li>📱 +598 98 910 715</li>
                            <li>📍 Montevideo, Uruguay</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-white/40">
                    © {new Date().getFullYear()} CEUTA Uruguay. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}
