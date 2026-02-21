'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn as cnUtil } from '@/lib/utils/cn';
import { saveInscripcionCookie, removeInscripcionCookie, getTokenByCursoId, updateInscripcionStateCookie } from '@/lib/hooks/useInscripcionCookie';
import { CheckCircle, User, CreditCard, PartyPopper, Loader2, Phone, ClipboardList, Upload, FileImage, FileText } from 'lucide-react';
import { PriceDisplay } from '@/components/cursos/PriceDisplay';
import { formatearPrecio } from '@/lib/utils/discountUtils';
import { UploadComprobante } from '@/components/payment/UploadComprobante';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { calcularDescuento } from '@/lib/utils/discountUtils';


interface EnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number;
    courseName: string;
    coursePrice: number | null;
    linkMercadoPago?: string | null;
    cantidadCuotas?: number;
    // Discount fields
    descuento_porcentaje?: number | null;
    descuento_cupos_totales?: number | null;
    descuento_cupos_usados?: number;
    descuento_etiqueta?: string | null;
    descuento_fecha_fin?: string | null;
}

interface FormData {
    nombre: string;
    email: string;
    telefono: string;
    cedula: string;
    edad: string;
    departamento: string;
    direccion: string;
    comoSeEntero: string;
    recibirNovedades: boolean;
    metodoPago: 'transferencia' | 'mercadopago' | 'efectivo' | '';
    codigoDescuento: string;
}

const DEPARTAMENTOS = [
    'Otro país',
    'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno',
    'Flores', 'Florida', 'Lavalleja', 'Maldonado', 'Montevideo',
    'Paysandú', 'Río Negro', 'Rivera', 'Rocha', 'Salto',
    'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres'
];

const COMO_SE_ENTERO_OPTIONS = [
    '¿Cómo te enteraste del curso?',
    'Redes sociales',
    'Búsqueda en Google',
    'Recomendación de un amigo',
    'Email / Newsletter',
    'Publicidad',
    'Otro'
];

type Step = 1 | 2 | 3 | 4;

// Tipo para la configuración de pagos desde la API
interface PaymentConfig {
    banco: {
        nombre: string;
        cuenta: string;
        titular: string;
        tipo: string;
        moneda: string;
    };
    efectivo: {
        habilitado: boolean;
        banco: {
            nombre: string;
            cuenta: string;
            titular: string;
        };
        instrucciones: string;
        codigo: string | null;
    };
    whatsapp: string;
}

const INITIAL_FORM_DATA: FormData = {
    nombre: '',
    email: '',
    telefono: '',
    cedula: '',
    edad: '',
    departamento: '',
    direccion: '',
    comoSeEntero: '',
    recibirNovedades: false,
    metodoPago: '',
    codigoDescuento: '',
};

function StepIndicator({ currentStep }: { currentStep: Step }) {
    const allSteps = [
        { number: 1, label: 'Contacto', icon: User },
        { number: 2, label: 'Detalles', icon: ClipboardList },
        { number: 3, label: 'Pago', icon: CreditCard },
        { number: 4, label: 'Listo', icon: CheckCircle },
    ];

    // Revelación progresiva: mostrar pasos hasta el actual + siempre "Listo" al final
    // Paso 1: Contacto → Listo
    // Paso 2: Contacto → Detalles → Listo
    // Paso 3+: Contacto → Detalles → Pago → Listo
    // Paso 3+: Contacto → Detalles → Pago → Listo
    const visibleSteps = allSteps.filter(s => s.number <= currentStep || s.number === 4);

    return (
        <div className="flex items-center justify-center mb-4">
            {visibleSteps.map((step, index) => (
                <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center">
                        <div
                            className={cnUtil(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                currentStep >= step.number
                                    ? "bg-green-700 text-white"
                                    : "bg-gray-200 text-gray-500"
                            )}
                        >
                            <step.icon className="w-5 h-5" />
                        </div>
                        <span
                            className={cnUtil(
                                "text-xs mt-1 font-medium",
                                currentStep >= step.number ? "text-green-700" : "text-gray-400"
                            )}
                        >
                            {step.label}
                        </span>
                    </div>
                    {index < visibleSteps.length - 1 && (
                        <div
                            className={cnUtil(
                                "w-12 h-0.5 mx-1 transition-colors",
                                currentStep > step.number ? "bg-green-700" : "bg-gray-200"
                            )}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

// PASO 1: Solo datos de contacto (micro-compromiso)
function Step1ContactData({
    formData,
    setFormData,
    onNext,
    isSubmitting,
}: {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    onNext: () => void;
    isSubmitting: boolean;
}) {
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const { track } = useAnalytics();

    // Track View Step 1
    useEffect(() => {
        track('enrollment_step_1_view');
    }, []);

    const validate = () => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }
        if (!formData.telefono.trim()) {
            newErrors.telefono = 'El teléfono es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            track('enrollment_step_1_complete');
            onNext();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-earth-900/70 text-center mb-4">
                Completá tus datos de contacto para reservar tu cupo
            </p>

            <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-earth-900 mb-1">
                    Nombre completo *
                </label>
                <Input
                    id="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Tu nombre y apellido"
                    className={errors.nombre ? 'border-red-500' : ''}
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-earth-900 mb-1">
                    Correo electrónico *
                </label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@email.com"
                    className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-earth-900 mb-1">
                    Celular *
                </label>
                <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="099 123 456"
                    className={errors.telefono ? 'border-red-500' : ''}
                />
                {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                    </>
                ) : (
                    'Reservar mi Cupo'
                )}
            </Button>

            <p className="text-xs text-earth-900/50 text-center">
                Solo te contactaremos para temas del curso
            </p>
        </form>
    );
}

// PASO 2: Datos adicionales (opcionales)
function Step2AdditionalData({
    formData,
    setFormData,
    onNext,
    onBack,
    isSubmitting,
}: {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    onNext: () => void;
    onBack: () => void;
    isSubmitting: boolean;
}) {
    const { track } = useAnalytics();

    // Track View Step 2
    useEffect(() => {
        track('enrollment_step_2_view');
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        track('enrollment_step_2_complete');
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-earth-900/70 text-center mb-4">
                Estos datos son opcionales pero nos ayudan a brindarte un mejor servicio
            </p>

            {/* Row 1: Cédula + Edad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="cedula" className="block text-sm font-medium text-earth-900 mb-1">
                        Cédula <span className="text-xs text-earth-900/50 font-normal">(opcional)</span>
                    </label>
                    <Input
                        id="cedula"
                        type="text"
                        value={formData.cedula}
                        onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                        placeholder="1.234.567-8"
                    />
                </div>
                <div>
                    <label htmlFor="edad" className="block text-sm font-medium text-earth-900 mb-1">
                        Edad <span className="text-xs text-earth-900/50 font-normal">(opcional)</span>
                    </label>
                    <Input
                        id="edad"
                        type="number"
                        min="1"
                        max="120"
                        value={formData.edad}
                        onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                        placeholder="Tu edad"
                    />
                </div>
            </div>

            {/* Row 2: Departamento + Dirección */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="departamento" className="block text-sm font-medium text-earth-900 mb-1">
                        Departamento <span className="text-xs text-earth-900/50 font-normal">(opcional)</span>
                    </label>
                    <select
                        id="departamento"
                        value={formData.departamento}
                        onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background dark:bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="">Seleccionar...</option>
                        {DEPARTAMENTOS.map((dep) => (
                            <option key={dep} value={dep}>{dep}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="direccion" className="block text-sm font-medium text-earth-900 mb-1">
                        Dirección <span className="text-xs text-earth-900/50 font-normal">(opcional)</span>
                    </label>
                    <Input
                        id="direccion"
                        type="text"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        placeholder="Tu dirección"
                    />
                </div>
            </div>

            {/* Row 3: Cómo te enteraste */}
            <div>
                <label htmlFor="comoSeEntero" className="block text-sm font-medium text-earth-900 mb-1">
                    ¿Cómo te enteraste? <span className="text-xs text-earth-900/50 font-normal">(opcional)</span>
                </label>
                <select
                    id="comoSeEntero"
                    value={formData.comoSeEntero}
                    onChange={(e) => setFormData({ ...formData, comoSeEntero: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background dark:bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    {COMO_SE_ENTERO_OPTIONS.map((opt, i) => (
                        <option key={opt} value={i === 0 ? '' : opt} disabled={i === 0}>
                            {opt}
                        </option>
                    ))}
                </select>
            </div>

            {/* Checkbox: Recibir novedades */}
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="recibirNovedades"
                    checked={formData.recibirNovedades}
                    onChange={(e) => setFormData({ ...formData, recibirNovedades: e.target.checked })}
                    className="h-4 w-4 text-green-700 focus:ring-green-700 border-gray-300 rounded"
                />
                <label htmlFor="recibirNovedades" className="text-sm text-earth-900">
                    Quiero recibir novedades sobre cursos
                </label>
            </div>

            <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                    Volver
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        'Continuar al Pago'
                    )}
                </Button>
            </div>
        </form>
    );
}

interface PaymentMethodProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    coursePrice: number | null;
    onNext: (method?: 'transferencia' | 'mercadopago' | 'efectivo') => void;
    onBack: () => void;
    courseName?: string;
    cantidadCuotas?: number;
    descuento_porcentaje?: number | null;
    descuento_cupos_totales?: number | null;
    descuento_cupos_usados?: number;
    descuento_etiqueta?: string | null;
    descuento_fecha_fin?: string | null;
    tipoPago: 'total' | 'seña';
    setTipoPago: (t: 'total' | 'seña') => void;
    finalPrice: number | null;
    setFinalPrice: (price: number | null) => void;
}

function Step3PaymentMethod({
    formData,
    setFormData,
    coursePrice,
    onNext,
    onBack,
    courseName,
    cantidadCuotas = 1,
    descuento_porcentaje,
    descuento_cupos_totales,
    descuento_cupos_usados,
    descuento_etiqueta,
    descuento_fecha_fin,
    tipoPago,
    setTipoPago,
    finalPrice,
    setFinalPrice,
}: PaymentMethodProps) {
    const [discountApplied, setDiscountApplied] = useState(false);
    const [discountError, setDiscountError] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const [showBanner, setShowBanner] = useState(true);
    const { track } = useAnalytics();

    // Track View Step 3
    useEffect(() => {
        track('enrollment_step_3_view', {
            metadata: { price: finalPrice || coursePrice }
        });
    }, []);

    const SENA_AMOUNT = 500;

    // Auto-hide banner after 4 seconds
    useEffect(() => {
        const timer = setTimeout(() => setShowBanner(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    const validateDiscount = async () => {
        if (!formData.codigoDescuento.trim()) return;

        setIsValidating(true);
        setDiscountError('');

        try {
            // Call RPC function to validate discount
            const response = await fetch('/api/validate-discount', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codigo: formData.codigoDescuento,
                    curso_id: null, // Could add course-specific validation
                }),
            });

            const result = await response.json();

            if (result.valid) {
                setDiscountApplied(true);
                // Apply discount
                if (coursePrice && result.tipo === 'porcentaje') {
                    setFinalPrice(coursePrice * (1 - result.valor / 100));
                } else if (coursePrice && result.tipo === 'monto') {
                    setFinalPrice(Math.max(0, coursePrice - result.valor));
                }
            } else {
                setDiscountError(result.message || 'Código inválido');
            }
        } catch {
            setDiscountError('Error validando código');
        } finally {
            setIsValidating(false);
        }
    };

    const handleMethodSelect = (method: 'transferencia' | 'mercadopago' | 'efectivo') => {
        setFormData(prev => ({ ...prev, metodoPago: method }));
        track('enrollment_payment_method_click', { metadata: { method } });
        // Pequenio timeout para asegurar que el estado se actualice antes de avanzar
        // aunque React 18+ batching lo maneja bien, Step4 lee formData.
        onNext(method);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    // NUEVO: Función unificada para calcular qué mostrar al usuario
    const getPaymentDisplayInfo = () => {
        const precioEfectivo = finalPrice || coursePrice || 0;

        // Caso: Seña
        if (tipoPago === 'seña') {
            return {
                amount: SENA_AMOUNT,
                label: 'Seña para reservar',
                subtitle: 'El resto lo abonás al comenzar el curso',
                showInstallmentInfo: false
            };
        }

        // Caso: 1 sola cuota
        if (cantidadCuotas <= 1) {
            return {
                amount: precioEfectivo,
                label: 'Total a pagar',
                subtitle: null,
                showInstallmentInfo: false
            };
        }

        // Caso: Múltiples cuotas - mostrar precio de UNA cuota
        const cuotaIndividual = Math.round(precioEfectivo / cantidadCuotas);
        return {
            amount: cuotaIndividual,
            label: `Primera cuota (1 de ${cantidadCuotas})`,
            subtitle: `Total del curso: ${formatearPrecio(precioEfectivo)}`,
            showInstallmentInfo: true
        };
    };

    // Helpers de compatibilidad (mantener para PriceDisplay)
    const formatCuotaValue = (price: number | null) => {
        return formatearPrecio(price ? (cantidadCuotas > 1 ? Math.round(price / cantidadCuotas) : price) : null);
    };

    const getPriceLabel = () => getPaymentDisplayInfo().label;

    const currentPriceToDisplay = tipoPago === 'seña' ? SENA_AMOUNT : (finalPrice || 0);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cupo Reservado Banner - aparece y desaparece */}
            {showBanner && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 relative overflow-hidden rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2.5 text-center shadow-md">
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">⏳</span>
                        <span className="text-sm font-semibold text-white">¡Tu cupo te espera!</span>
                        <span className="text-xs text-green-100">Confirmalo completando el pago</span>
                    </div>
                </div>
            )}

            {/* Selector Seña vs Total */}
            <div className="bg-gray-50 dark:bg-muted/20 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                <p className="text-sm font-medium text-center mb-3 text-earth-900 dark:text-gray-100">¿Qué deseas abonar hoy?</p>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => setTipoPago('total')}
                        className={cnUtil(
                            "py-2 px-3 rounded-md text-sm font-medium transition-all border-2",
                            tipoPago === 'total'
                                ? "border-green-600 bg-background dark:bg-card text-green-700 shadow-sm"
                                : "border-transparent bg-gray-100 dark:bg-muted text-gray-500 hover:bg-gray-200 dark:hover:bg-muted/80"
                        )}
                    >
                        Total / Cuota
                    </button>
                    <button
                        type="button"
                        onClick={() => setTipoPago('seña')}
                        className={cnUtil(
                            "py-2 px-3 rounded-md text-sm font-medium transition-all border-2",
                            tipoPago === 'seña'
                                ? "border-green-600 bg-background dark:bg-card text-green-700 shadow-sm"
                                : "border-transparent bg-gray-100 dark:bg-muted text-gray-500 hover:bg-gray-200 dark:hover:bg-muted/80"
                        )}
                    >
                        Seña ({formatearPrecio(SENA_AMOUNT)})
                    </button>
                </div>
            </div>




            {/* Price Summary - REDISEÑADO para mostrar UNA cuota */}
            <div className="text-center py-3">
                {tipoPago === 'seña' ? (
                    /* Caso: Seña */
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">
                            {getPaymentDisplayInfo().label}
                        </p>
                        <span className="font-heading text-4xl font-bold text-green-700">
                            {formatearPrecio(SENA_AMOUNT)}
                        </span>
                        <p className="text-sm text-muted-foreground mt-2">
                            {getPaymentDisplayInfo().subtitle}
                        </p>
                    </div>
                ) : (
                    /* Caso: Total/Cuota */
                    <div>
                        {/* Badge de descuento */}
                        {!discountApplied && descuento_etiqueta && (
                            <span className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-medium px-3 py-1 rounded-full mb-3">
                                🔥 {descuento_etiqueta}
                            </span>
                        )}

                        {/* Countdown Timer */}
                        {!discountApplied && descuento_fecha_fin && (
                            <div className="mb-3">
                                <CountdownTimer
                                    targetDate={descuento_fecha_fin}
                                    variant="subtle"
                                    label="Oferta válida por:"
                                    className="border-green-100 dark:border-green-900/30 bg-green-50/50"
                                />
                            </div>
                        )}

                        {/* Precio original tachado si hay descuento */}
                        {!discountApplied && descuento_porcentaje && descuento_porcentaje > 0 && (
                            <p className="text-gray-400 line-through text-sm mb-1">
                                {formatearPrecio(cantidadCuotas > 1
                                    ? Math.round((coursePrice || 0) / cantidadCuotas)
                                    : coursePrice
                                )}
                            </p>
                        )}

                        {/* Label: "Primera cuota (1 de 3)" o "Total a pagar" */}
                        <p className="text-sm text-muted-foreground mb-1">
                            {getPaymentDisplayInfo().label}
                        </p>

                        {/* Precio Principal - UNA CUOTA */}
                        <p className="font-heading text-4xl font-bold text-green-700">
                            {formatearPrecio(getPaymentDisplayInfo().amount)}
                        </p>

                        {/* Subtítulo: Total del curso si hay cuotas */}
                        {getPaymentDisplayInfo().subtitle && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {getPaymentDisplayInfo().subtitle}
                            </p>
                        )}

                        {/* Ahorro */}
                        {!discountApplied && descuento_porcentaje && descuento_porcentaje > 0 && (
                            <p className="text-sm text-green-600 font-medium mt-1">
                                Ahorrás {formatearPrecio(Math.round((coursePrice || 0) * descuento_porcentaje / 100))}
                            </p>
                        )}

                        {/* Cupos disponibles */}
                        {!discountApplied && descuento_cupos_totales && (descuento_cupos_totales - (descuento_cupos_usados || 0)) > 0 && (descuento_cupos_totales - (descuento_cupos_usados || 0)) < 6 && (
                            <p className="text-sm text-amber-600 font-medium mt-2">
                                {descuento_cupos_totales - (descuento_cupos_usados || 0)} cupos disponibles
                            </p>
                        )}

                        {/* Precio con código aplicado */}
                        {discountApplied && (
                            <div className="mt-2 p-2 bg-green-50 rounded border border-green-100 animate-in fade-in">
                                <p className="text-sm font-bold text-green-700">
                                    ✓ Código aplicado: {formatearPrecio(getPaymentDisplayInfo().amount)}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Payment Method - PRIMERO para móvil */}
            <div className="space-y-3">
                <p className="text-sm font-medium text-earth-900 dark:text-gray-100 text-center">
                    Elegí tu método de pago:
                </p>

                <div className="grid grid-cols-3 gap-2">
                    {/* Option 1: Transferencia */}
                    <button
                        type="button"
                        onClick={() => handleMethodSelect('transferencia')}
                        className={cnUtil(
                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all group",
                            formData.metodoPago === 'transferencia'
                                ? "border-green-600 bg-green-50 dark:bg-green-900/20 shadow-sm"
                                : "border-transparent bg-gray-50 dark:bg-muted/40 hover:bg-background dark:hover:bg-muted/60 hover:border-green-200"
                        )}
                    >
                        <div className={cnUtil(
                            "w-10 h-10 rounded-full flex items-center justify-center text-xl mb-1 transition-colors",
                            formData.metodoPago === 'transferencia'
                                ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                                : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                        )}>
                            🏦
                        </div>
                        <span className="font-medium text-earth-900 dark:text-white text-xs text-center">Transferencia</span>
                    </button>

                    {/* Option 2: Mercado Pago */}
                    <button
                        type="button"
                        onClick={() => handleMethodSelect('mercadopago')}
                        className={cnUtil(
                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all group",
                            formData.metodoPago === 'mercadopago'
                                ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 shadow-sm"
                                : "border-transparent bg-gray-50 dark:bg-muted/40 hover:bg-background dark:hover:bg-muted/60 hover:border-cyan-200"
                        )}
                    >
                        <div className={cnUtil(
                            "w-10 h-10 rounded-full flex items-center justify-center text-xl mb-1 transition-colors",
                            formData.metodoPago === 'mercadopago'
                                ? "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-300"
                                : "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400"
                        )}>
                            💳
                        </div>
                        <span className="font-medium text-earth-900 dark:text-white text-xs text-center">Mercado Pago</span>
                    </button>

                    {/* Option 3: Efectivo */}
                    <button
                        type="button"
                        onClick={() => handleMethodSelect('efectivo')}
                        className={cnUtil(
                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all group",
                            formData.metodoPago === 'efectivo'
                                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-sm"
                                : "border-transparent bg-gray-50 dark:bg-muted/40 hover:bg-background dark:hover:bg-muted/60 hover:border-orange-200"
                        )}
                    >
                        <div className={cnUtil(
                            "w-10 h-10 rounded-full flex items-center justify-center text-xl mb-1 transition-colors",
                            formData.metodoPago === 'efectivo'
                                ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300"
                                : "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400"
                        )}>
                            💵
                        </div>
                        <span className="font-medium text-earth-900 dark:text-white text-xs text-center">Efectivo</span>
                    </button>
                </div>
            </div>

            {/* Código de descuento - COLAPSABLE */}
            {tipoPago === 'total' && (
                <details className="mt-3 group">
                    <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1 justify-center">
                        💡 ¿Tenés código de descuento?
                        <span className="text-xs group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="mt-3 flex gap-2">
                        <Input
                            type="text"
                            value={formData.codigoDescuento}
                            onChange={(e) => {
                                setFormData({ ...formData, codigoDescuento: e.target.value.toUpperCase() });
                                setDiscountApplied(false);
                                setDiscountError('');
                            }}
                            placeholder="CODIGO2024"
                            disabled={discountApplied}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={validateDiscount}
                            disabled={isValidating || discountApplied || !formData.codigoDescuento}
                        >
                            {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
                        </Button>
                    </div>
                    {discountError && <p className="text-red-500 text-xs mt-1">{discountError}</p>}
                    {discountApplied && <p className="text-green-700 text-xs mt-1">✓ Código aplicado</p>}
                </details>
            )}

            {/* Información Importante - Box Azul */}
            <div className="bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-lg p-3 text-left mt-4">
                <div className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5 text-sm flex-shrink-0">ℹ️</span>
                    <ul className="text-xs text-blue-800 dark:text-blue-200/80 space-y-1 list-disc pl-3">
                        {cantidadCuotas > 1 && (
                            <li>
                                <strong>Pago mes a mes:</strong> No es suscripción automática. Realizás cada cuota manualmente.
                            </li>
                        )}
                        <li>
                            <strong>Garantía:</strong> Podés cancelar y solicitar reembolso antes del inicio del curso.
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex gap-3 mt-4">
                <Button type="button" variant="outline" onClick={onBack} className="w-full">
                    Volver
                </Button>
            </div>
        </form>
    );
}



function Step4Confirmation({
    formData,
    courseName,
    onClose,
    courseId,
    enrollmentId,
    token,
    linkMercadoPago,
    amountToPay,
    cantidadCuotas = 1,
    tipoPago = 'total',
}: {
    formData: FormData;
    courseName: string;
    onClose: () => void;
    courseId: number;
    enrollmentId?: number;
    token?: string | null;
    linkMercadoPago?: string | null;
    amountToPay: number;
    cantidadCuotas?: number;
    tipoPago?: 'total' | 'seña';
}) {
    const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const { track } = useAnalytics();

    // Helper para calcular qué mostrar según el tipo de pago
    const getDisplayInfo = () => {
        if (tipoPago === 'seña') {
            return {
                amount: 500,
                label: 'Seña para reservar',
                subtitle: 'El resto lo abonás al comenzar el curso'
            };
        }

        if (cantidadCuotas > 1) {
            const cuotaAmount = Math.round(amountToPay / cantidadCuotas);
            return {
                amount: cuotaAmount,
                label: `Primera cuota (1 de ${cantidadCuotas})`,
                subtitle: `Total del curso: ${formatearPrecio(amountToPay)}`
            };
        }

        return {
            amount: amountToPay,
            label: 'Monto a pagar',
            subtitle: null
        };
    };

    // Static Mercado Pago Link
    const FINAL_MP_LINK = linkMercadoPago || "https://link.mercadopago.com.uy/ceutacapacitaciones";

    // Track View Step 4 (Confirmation)
    useEffect(() => {
        track('enrollment_step_4_view');
    }, []);

    const handleUploadSuccess = () => {
        setUploadSuccess(true);
        track('enrollment_comprobante_upload');
    };

    // Static Mercado Pago Link
    const STATIC_MP_LINK = "https://link.mercadopago.com.uy/ceutacapacitaciones";

    // Fetch payment configuration from API
    useEffect(() => {
        fetch('/api/configuracion/pagos')
            .then(res => res.json())
            .then(data => {
                setPaymentConfig(data);
            })
            .catch(err => console.error('Error fetching payment config:', err))
            .finally(() => setLoadingConfig(false));
    }, []);

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_JULIA || '';
    const whatsappMessage = encodeURIComponent(
        `Hola! Me inscribí al curso "${courseName}". Mi nombre es ${formData.nombre} y voy a pagar por ${formData.metodoPago === 'transferencia' ? 'transferencia bancaria' : formData.metodoPago === 'efectivo' ? 'Abitab/Red Pagos (efectivo)' : 'Mercado Pago'}.`
    );
    const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${whatsappMessage}`;

    // Success State after Upload
    if (uploadSuccess) {
        return (
            <div className="py-8 text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-4xl animate-in zoom-in">
                    🎉
                </div>
                <div>
                    <h3 className="font-heading text-2xl font-bold text-earth-900">
                        ¡Comprobante Recibido!
                    </h3>
                    <p className="text-earth-900/60 mt-2 max-w-sm mx-auto">
                        Gracias {formData.nombre.split(' ')[0]}. Estamos verificando tu pago. Te avisaremos cuando tu cupo esté 100% confirmado.
                    </p>
                </div>
                <div className="pt-4">
                    <Button onClick={onClose} className="w-full">
                        Entendido, cerrar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-2">
            {/* Header minimalista */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <CheckCircle className="w-4 h-4" />
                    <span>Inscripción registrada</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-earth-900">
                    {formData.metodoPago === 'mercadopago' ? 'Último paso: Realizar Pago' : 'Último paso: Completar Pago'}
                </h3>
                <p className="text-sm text-earth-900/60 mt-1">
                    {formData.nombre.split(' ')[0]}, completá el pago para confirmar tu lugar en <strong>{courseName}</strong>
                </p>
            </div>

            {/* Change Method & Status */}
            <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 text-xs text-earth-900/50 dark:text-foreground/40 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">
                    <span>Método seleccionado: <strong className="dark:text-foreground/60">{formData.metodoPago === 'mercadopago' ? 'Mercado Pago' : formData.metodoPago === 'transferencia' ? 'Transferencia Bancaria' : 'Efectivo'}</strong></span>
                </div>
            </div>

            {/* Payment Details Container */}
            <div className="space-y-6">

                {/* TRANSFERENCIA */}
                {formData.metodoPago === 'transferencia' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-xl border border-slate-200 dark:border-white/10">
                            <h3 className="font-semibold text-earth-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-xl">🏦</span> Datos Bancarios
                            </h3>

                            {/* MONTO A PAGAR */}
                            <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-white/10 rounded-xl p-4 mb-4 text-center">
                                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-1">
                                    {getDisplayInfo().label}
                                </p>
                                <span className="text-2xl sm:text-3xl font-bold text-earth-900 dark:text-white">
                                    {formatearPrecio(getDisplayInfo().amount)}
                                </span>
                                {getDisplayInfo().subtitle && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {getDisplayInfo().subtitle}
                                    </p>
                                )}
                            </div>

                            {loadingConfig ? (
                                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin opacity-50" /></div>
                            ) : (
                                <div className="grid gap-3 text-sm text-walnut-700 dark:text-gray-300">
                                    <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                                        <span>Banco:</span>
                                        <span className="font-medium">{paymentConfig?.banco?.nombre || 'BROU'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                                        <span>Titular:</span>
                                        <span className="font-medium">{paymentConfig?.banco?.titular || 'CEUTA'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                                        <span>Tipo:</span>
                                        <span className="font-medium">{paymentConfig?.banco?.tipo || 'Caja de Ahorro en Pesos'}</span>
                                    </div>
                                    <div className="flex justify-between items-center sm:items-start flex-col sm:flex-row gap-1">
                                        <span>Cuenta:</span>
                                        <span className="font-mono bg-white dark:bg-black/20 px-2 py-1 rounded border border-slate-200 dark:border-white/10 select-all">
                                            {paymentConfig?.banco?.cuenta || 'Consultar'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!showUpload ? (
                            <button
                                onClick={() => setShowUpload(true)}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Ya hice la transferencia (Subir Comprobante)
                            </button>
                        ) : (
                            <div className="animate-in fade-in zoom-in-95">
                                <UploadComprobante
                                    token={token || ''}
                                    onSuccess={() => {
                                        updateInscripcionStateCookie(courseId, 'revisando');
                                        setUploadSuccess(true);
                                    }}
                                    onError={(msg) => console.error(msg)}
                                />
                                <button
                                    onClick={() => setShowUpload(false)}
                                    className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Cancelar subida
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* EFECTIVO */}
                {formData.metodoPago === 'efectivo' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-orange-50 dark:bg-orange-950/20 p-5 rounded-xl border border-orange-100 dark:border-orange-500/20">
                            <h3 className="font-semibold text-earth-900 dark:text-orange-50 mb-4 flex items-center gap-2">
                                <span className="text-xl">💵</span> Pago en Abitab / Red Pagos
                            </h3>

                            {/* MONTO A PAGAR */}
                            <div className="bg-white dark:bg-orange-900/20 border border-orange-200 dark:border-orange-500/20 rounded-xl p-4 mb-4 text-center">
                                <p className="text-xs uppercase tracking-wider text-orange-600 dark:text-orange-400 font-medium mb-1">
                                    {getDisplayInfo().label}
                                </p>
                                <span className="text-2xl sm:text-3xl font-bold text-earth-900 dark:text-white">
                                    {formatearPrecio(getDisplayInfo().amount)}
                                </span>
                                {getDisplayInfo().subtitle && (
                                    <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">
                                        {getDisplayInfo().subtitle}
                                    </p>
                                )}
                            </div>

                            {loadingConfig ? (
                                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin opacity-50" /></div>
                            ) : (
                                <>
                                    <p className="text-sm text-walnut-700 dark:text-orange-100/70 mb-4">{paymentConfig?.efectivo?.instrucciones || 'Acercate a cualquier Abitab o Red Pagos y solicitá realizar un depósito en la cuenta BROU (Caja de Ahorro en Pesos) detallada a continuación'}</p>
                                    <div className="grid gap-3 text-sm text-walnut-700 dark:text-orange-100/80">
                                        <div className="flex justify-between border-b border-orange-100 dark:border-orange-500/10 pb-2">
                                            <span>Titular:</span>
                                            <span className="font-medium">{paymentConfig?.efectivo?.banco?.titular || 'CEUTA'}</span>
                                        </div>
                                        {paymentConfig?.efectivo?.codigo && (
                                            <div className="flex justify-between border-b border-orange-100 dark:border-orange-500/10 pb-2">
                                                <span>Cédula/Código:</span>
                                                <span className="font-mono font-medium">{paymentConfig.efectivo.codigo}</span>
                                            </div>
                                        )}
                                        {paymentConfig?.efectivo?.banco?.cuenta && (
                                            <div className="flex justify-between items-center sm:items-start flex-col sm:flex-row gap-1">
                                                <span>Cuenta:</span>
                                                <span className="font-mono bg-white dark:bg-black/20 px-2 py-1 rounded border border-orange-200 dark:border-white/10 select-all">
                                                    {paymentConfig.efectivo.banco.cuenta}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {!showUpload ? (
                            <button
                                onClick={() => setShowUpload(true)}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Ya realicé el pago (Subir Comprobante)
                            </button>
                        ) : (
                            <div className="animate-in fade-in zoom-in-95">
                                <UploadComprobante
                                    token={token || ''}
                                    onSuccess={() => {
                                        updateInscripcionStateCookie(courseId, 'revisando');
                                        setUploadSuccess(true);
                                    }}
                                    onError={(msg) => console.error(msg)}
                                />
                                <button
                                    onClick={() => setShowUpload(false)}
                                    className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Cancelar subida
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* MERCADO PAGO - SMART BRIDGE UI */}
                {formData.metodoPago === 'mercadopago' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-cyan-50 dark:bg-cyan-950/20 p-5 rounded-xl border border-cyan-100 dark:border-cyan-500/20">
                            <h3 className="font-semibold text-earth-900 dark:text-cyan-50 mb-6 flex items-center gap-2">
                                <span>💳</span> Pago con Mercado Pago
                            </h3>

                            <div className="space-y-6">
                                {/* 1. Value Display & Copy - Using getDisplayInfo() like other methods */}
                                <div className="bg-white dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-700/50 rounded-xl p-5 text-center shadow-sm">
                                    <p className="text-xs uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-semibold mb-2">
                                        {getDisplayInfo().label}
                                    </p>
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-3xl sm:text-4xl font-bold text-earth-900 dark:text-white">
                                            {formatearPrecio(getDisplayInfo().amount)}
                                        </span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(getDisplayInfo().amount.toString());
                                                const btn = document.getElementById('copy-price-btn-modal');
                                                if (btn) {
                                                    btn.innerHTML = '✅';
                                                    setTimeout(() => { if (btn) btn.innerHTML = '📋'; }, 2000);
                                                }
                                            }}
                                            id="copy-price-btn-modal"
                                            className="p-2 bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-800 dark:hover:bg-cyan-700 text-cyan-700 dark:text-cyan-200 rounded-lg transition-colors"
                                            title="Copiar monto"
                                        >
                                            📋
                                        </button>
                                    </div>
                                    {getDisplayInfo().subtitle && (
                                        <p className="text-xs text-cyan-600/70 dark:text-cyan-400/70 mt-1">
                                            {getDisplayInfo().subtitle}
                                        </p>
                                    )}
                                </div>

                                {/* 2. Instructions */}
                                <div className="space-y-3">
                                    <div className="flex gap-3 items-start">
                                        <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                                        <p className="text-sm text-walnut-700 dark:text-cyan-100/80">
                                            Copiá el monto exacto de arriba.
                                        </p>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                                        <p className="text-sm text-walnut-700 dark:text-cyan-100/80">
                                            Ingresá al link de pago y escribí ese monto manualmente.
                                        </p>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                                        <p className="text-sm text-walnut-700 dark:text-cyan-100/80">
                                            Recibirás el comprobante por email y nosotros verificaremos tu pago.
                                        </p>
                                    </div>
                                </div>

                                {/* 3. Action Button */}
                                <a
                                    href={FINAL_MP_LINK}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center py-4 bg-[#009ee3] hover:bg-[#0082c3] text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-[0.98] group"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Ir a Pagar en Mercado Pago
                                        <span className="group-hover:translate-x-1 transition-transform">↗</span>
                                    </span>
                                </a>

                                <p className="text-xs text-center text-cyan-600/60 dark:text-cyan-400/50">
                                    Se abrirá en una nueva pestaña
                                </p>
                            </div>
                        </div>

                        {!showUpload ? (
                            <button
                                onClick={() => setShowUpload(true)}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-green-600/20 flex flex-col items-center justify-center gap-1"
                            >
                                <span>✅ Ya realicé el pago</span>
                                <span className="text-xs opacity-90 font-normal">Subir comprobante ahora</span>
                            </button>
                        ) : (
                            <div className="animate-in fade-in zoom-in-95">
                                <UploadComprobante
                                    token={token || ''}
                                    onSuccess={() => {
                                        updateInscripcionStateCookie(courseId, 'revisando');
                                        setUploadSuccess(true);
                                    }}
                                    onError={(msg) => console.error(msg)}
                                />
                                <button
                                    onClick={() => setShowUpload(false)}
                                    className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Cancelar subida
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Buttons */}
            <div className="mt-8 space-y-3">
                <Button asChild variant="outline" className="w-full border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/20 text-green-700 dark:text-green-500">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        <Phone className="w-4 h-4 mr-2" />
                        ¿Tenés dudas? Contactar por WhatsApp
                    </a>
                </Button>
                <Button variant="ghost" onClick={onClose} className="w-full text-gray-400 hover:text-gray-600">
                    Cerrar ventana
                </Button>
            </div>
        </div>
    );
}

export function EnrollmentModal({
    isOpen,
    onClose,
    courseId,
    courseName,
    coursePrice,
    linkMercadoPago,
    cantidadCuotas,
    descuento_porcentaje,
    descuento_cupos_totales,
    descuento_cupos_usados,
    descuento_etiqueta,
    descuento_fecha_fin,
}: EnrollmentModalProps) {
    const { track } = useAnalytics();
    const [step, setStep] = useState<Step>(1);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Track Modal Open/Close
    useEffect(() => {
        if (isOpen) {
            track('enrollment_modal_open', { courseId });
        } else {
            track('enrollment_modal_close', { courseId, metadata: { lastStep: step } });
        }
    }, [isOpen]);

    const [enrollmentId, setEnrollmentId] = useState<number | undefined>(undefined);
    const [token, setToken] = useState<string | null>(null);
    const [tipoPago, setTipoPago] = useState<'total' | 'seña'>('total');
    // Lifted state for final price (after discount)
    const [finalPrice, setFinalPrice] = useState<number | null>(coursePrice);

    // Update finalPrice when coursePrice changes (initial load)
    // FIX: Apply automatic discount calculation on init
    useEffect(() => {
        if (coursePrice) {
            const descuento = calcularDescuento({
                precioOriginal: coursePrice,
                descuentoPorcentaje: descuento_porcentaje || null,
                cuposTotales: descuento_cupos_totales || null,
                cuposUsados: descuento_cupos_usados || 0,
                etiqueta: descuento_etiqueta || null,
                fechaFin: descuento_fecha_fin || null,
            });
            setFinalPrice(descuento.precioFinal);
        } else {
            setFinalPrice(null);
        }
    }, [coursePrice, descuento_porcentaje, descuento_cupos_totales, descuento_cupos_usados, descuento_etiqueta, descuento_fecha_fin]);

    const handleClose = () => {
        // Reset state when closing
        setStep(1);
        setFormData(INITIAL_FORM_DATA);
        setEnrollmentId(undefined);
        setToken(null);
        setTipoPago('total');
        onClose();
    };

    // Paso 1 -> Paso 2: Guardar datos de contacto en BD y avanzar
    const handleStep1Next = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/inscripcion/preinscripcion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    curso_id: courseId,
                    nombre: formData.nombre,
                    email: formData.email,
                    telefono: formData.telefono,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.id) {
                    setEnrollmentId(data.id);
                }
                // Guardar cookie para que el banner aparezca si el usuario abandona
                if (data.accessToken) {
                    setToken(data.accessToken);
                    saveInscripcionCookie(
                        data.accessToken,
                        formData.nombre.split(' ')[0], // Solo primer nombre
                        courseId,
                        data.cursoNombre || courseName
                    );
                }
            }
            // Siempre avanzar al paso 2, incluso si falla el guardado
            setStep(2);
        } catch (error) {
            console.error('Error guardando datos de contacto:', error);
            // Avanzar de todos modos para no bloquear la UX
            setStep(2);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Paso 2 -> Paso 3: Enviar pre-inscripción con datos de contacto + adicionales
    const submitPreEnrollment = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/inscripcion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enrollment_id: enrollmentId, // Actualizar registro existente
                    curso_id: courseId,
                    nombre: formData.nombre || null,
                    email: formData.email,
                    telefono: formData.telefono,
                    cedula: formData.cedula || null,
                    edad: formData.edad ? parseInt(formData.edad) : null,
                    departamento: formData.departamento || null,
                    direccion: formData.direccion || null,
                    como_se_entero: formData.comoSeEntero || null,
                    recibir_novedades: formData.recibirNovedades,
                    metodo_pago: null, // Will be selected in step 3
                    codigo_descuento: formData.codigoDescuento || null,
                }),
            });

            if (!response.ok) {
                throw new Error('Error al registrar pre-inscripción');
            }

            const data = await response.json();
            if (data.id) {
                setEnrollmentId(data.id);
            }
            // Advance to payment method selection
            setStep(3);
        } catch (error) {
            console.error('Pre-enrollment error:', error);
            // Still proceed to step 3 for better UX
            setStep(3);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Paso 3 -> Paso 4: Confirmar inscripción con método de pago
    const submitEnrollment = async (methodOverride?: 'transferencia' | 'mercadopago' | 'efectivo') => {
        setIsSubmitting(true);
        try {
            const selectedMethod = methodOverride || formData.metodoPago || null;
            const amountToPay = tipoPago === 'seña' ? 500 : (finalPrice ?? coursePrice);

            // Update existing enrollment with payment method
            const response = await fetch('/api/inscripcion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enrollment_id: enrollmentId, // Actualizar registro existente
                    curso_id: courseId,
                    nombre: formData.nombre || null,
                    email: formData.email,
                    telefono: formData.telefono,
                    cedula: formData.cedula || null,
                    edad: formData.edad ? parseInt(formData.edad) : null,
                    departamento: formData.departamento || null,
                    direccion: formData.direccion || null,
                    como_se_entero: formData.comoSeEntero || null,
                    recibir_novedades: formData.recibirNovedades,
                    metodo_pago: selectedMethod,
                    codigo_descuento: formData.codigoDescuento || null,
                    tipo_pago: tipoPago,
                    // Use finalPrice if available and paying total, otherwise seña amount or fallback to coursePrice
                    monto_pago: amountToPay,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                throw new Error(errorData.message || 'Error al registrar inscripción');
            }

            const data = await response.json();
            const currentEnrollmentId = data.id || enrollmentId;

            if (currentEnrollmentId) {
                setEnrollmentId(currentEnrollmentId);
            }

            // MERCADO PAGO INTEGRATION
            // [SMART BRIDGE UPDATE]
            // We removed the automatic redirection logic to prioritize the "Guided Payment" UI.
            // The user will see instructions to pay the exact amount using the static link.

            // if (selectedMethod === 'mercadopago') { ... logic removed ... }

            // Si la inscripción fue exitosa, NO removemos el banner de pendiente
            // Queremos que siga apareciendo hasta que suba el comprobante o se verifique
            // removeInscripcionCookie(courseId);

            setStep(4);
            setIsSubmitting(false); // Only stop submitting if we reached here (not redirected)
        } catch (error) {
            console.error('Enrollment error:', error);
            // Mostrar error al usuario si es necesario, por ahora log
            setStep(4);
            setIsSubmitting(false);
        }
    };

    const handleStep3Next = (method?: 'transferencia' | 'mercadopago' | 'efectivo') => {
        submitEnrollment(method);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="font-heading text-xl text-center">
                        {step < 4 ? `Inscripción: ${courseName}` : ''}
                    </DialogTitle>
                </DialogHeader>

                {step < 4 && <StepIndicator currentStep={step} />}

                {step === 1 && (
                    <Step1ContactData
                        formData={formData}
                        setFormData={setFormData}
                        onNext={handleStep1Next}
                        isSubmitting={isSubmitting}
                    />
                )}

                {step === 2 && (
                    <Step2AdditionalData
                        formData={formData}
                        setFormData={setFormData}
                        onNext={submitPreEnrollment}
                        onBack={() => setStep(1)}
                        isSubmitting={isSubmitting}
                    />
                )}

                {step === 3 && (
                    <Step3PaymentMethod
                        formData={formData}
                        setFormData={setFormData}
                        coursePrice={coursePrice}
                        courseName={courseName}
                        onNext={handleStep3Next}
                        onBack={() => setStep(2)}
                        cantidadCuotas={cantidadCuotas}
                        descuento_porcentaje={descuento_porcentaje}
                        descuento_cupos_totales={descuento_cupos_totales}
                        descuento_cupos_usados={descuento_cupos_usados}
                        descuento_etiqueta={descuento_etiqueta}
                        descuento_fecha_fin={descuento_fecha_fin}
                        tipoPago={tipoPago}
                        setTipoPago={setTipoPago}
                        finalPrice={finalPrice}
                        setFinalPrice={setFinalPrice}
                    />
                )}

                {step === 4 && (
                    <Step4Confirmation
                        formData={formData}
                        courseName={courseName}
                        onClose={handleClose}
                        courseId={courseId}
                        enrollmentId={enrollmentId}
                        token={token}
                        linkMercadoPago={linkMercadoPago}
                        amountToPay={tipoPago === 'seña' ? 500 : (finalPrice ?? (coursePrice || 0))}
                        cantidadCuotas={cantidadCuotas}
                        tipoPago={tipoPago}
                    />
                )}

                {isSubmitting && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                        <Loader2 className="w-8 h-8 text-green-700 animate-spin" />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

