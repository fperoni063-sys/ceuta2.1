import { Leaf, Users, Award, BookOpen } from "lucide-react";

const features = [
    {
        icon: Leaf,
        title: "30+ años de experiencia",
        description: "Pioneros en Tecnologías Apropiadas en Uruguay.",
    },
    {
        icon: Users,
        title: "Comunidad activa",
        description: "Miles de egresados aplicando soluciones prácticas en todo el país.",
    },
    {
        icon: BookOpen,
        title: "Formación integral",
        description: "Aprender haciendo: Enfoque teórico-práctico aplicable a tu realidad.",
    },
    {
        icon: Award,
        title: "Certificación reconocida",
        description: "Diplomas avalados por instituciones de referencia en el área.",
    },
];

export function WhyCeuta() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="font-heading text-3xl md:text-4xl text-earth-900 mb-4">
                        ¿Por qué elegir CEUTA?
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Somos el Centro Uruguayo de Tecnologías Apropiadas, referentes en
                        educación para la sustentabilidad en el país.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="text-center p-6 rounded-xl hover:bg-cream transition-colors group"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-700/10 text-green-700 mb-6 group-hover:bg-green-700 group-hover:text-white transition-colors">
                                <feature.icon size={32} />
                            </div>
                            <h3 className="font-heading text-xl text-earth-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
