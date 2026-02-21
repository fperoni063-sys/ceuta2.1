'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Plus, Trash2 } from 'lucide-react';

interface ConfigItem {
    id: number;
    clave: string;
    valor: string;
    descripcion: string | null;
}

const commonConfigs = [
    // Datos bancarios
    { clave: 'banco_nombre', descripcion: 'Nombre del banco para transferencias', default: 'BROU' },
    { clave: 'banco_cuenta', descripcion: 'Número de cuenta bancaria', default: '' },
    { clave: 'banco_titular', descripcion: 'Titular de la cuenta', default: 'CEUTA' },
    { clave: 'banco_tipo', descripcion: 'Tipo de cuenta (Caja de Ahorros, Cuenta Corriente)', default: 'Caja de Ahorros' },
    { clave: 'banco_moneda', descripcion: 'Moneda de la cuenta', default: 'Pesos Uruguayos' },
    // Pagos en efectivo
    { clave: 'efectivo_habilitado', descripcion: 'Mostrar opción de pago en efectivo (true/false)', default: 'true' },
    { clave: 'efectivo_banco_nombre', descripcion: 'Banco para pagos Abitab/RedPagos (si es diferente a transferencia)', default: '' },
    { clave: 'efectivo_banco_cuenta', descripcion: 'Cuenta para pagos Abitab/RedPagos', default: '' },
    { clave: 'efectivo_banco_titular', descripcion: 'Titular de la cuenta para Abitab/RedPagos', default: '' },
    { clave: 'efectivo_instrucciones', descripcion: 'Instrucciones para el usuario', default: 'Acercate a cualquier Abitab o Red Pagos y mencioná que querés pagar a CEUTA' },
    { clave: 'efectivo_codigo', descripcion: 'Código de servicio (si aplica)', default: '' },
    // Contacto
    { clave: 'whatsapp_contacto', descripcion: 'WhatsApp General (Inscripciones/Pagos)', default: '59898910715' },
    { clave: 'whatsapp_secretaria', descripcion: 'WhatsApp Secretaría (Administración)', default: '59891431577' },
    { clave: 'email_contacto', descripcion: 'Email de contacto principal', default: 'secretaria@ceuta.org.uy' },
    { clave: 'direccion', descripcion: 'Dirección de CEUTA', default: 'Canelones 1198, Montevideo' },
];

export default function AdminConfiguracionPage() {
    const [configs, setConfigs] = useState<ConfigItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchConfigs();
    }, []);

    async function fetchConfigs() {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/configuracion');
            if (response.ok) {
                const data = await response.json();
                setConfigs(data || []);
            } else {
                console.error('Error fetching configs');
            }
        } catch (error) {
            console.error('Error fetching configs:', error);
        }
        setLoading(false);
    }

    const getConfigValue = (clave: string): string => {
        const config = configs.find(c => c.clave === clave);
        return config?.valor || '';
    };

    const updateConfigValue = (clave: string, valor: string) => {
        setConfigs(prev => {
            const existing = prev.find(c => c.clave === clave);
            if (existing) {
                return prev.map(c => c.clave === clave ? { ...c, valor } : c);
            } else {
                const common = commonConfigs.find(cc => cc.clave === clave);
                return [...prev, {
                    id: -Date.now(), // Temporary ID
                    clave,
                    valor,
                    descripcion: common?.descripcion || null,
                }];
            }
        });
    };

    const saveConfigs = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            for (const config of configs) {
                if (config.id < 0) {
                    // New config - insert
                    await fetch('/api/admin/configuracion', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            clave: config.clave,
                            valor: config.valor,
                            descripcion: config.descripcion,
                        }),
                    });
                } else {
                    // Existing config - update
                    await fetch(`/api/admin/configuracion/${config.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            valor: config.valor,
                            updated_at: new Date().toISOString(),
                        }),
                    });
                }
            }

            setMessage({ type: 'success', text: 'Configuración guardada correctamente.' });
            await fetchConfigs();
        } catch (error) {
            console.error('Error saving configs:', error);
            setMessage({ type: 'error', text: 'Error al guardar la configuración.' });
        } finally {
            setSaving(false);
        }
    };

    const addCustomConfig = () => {
        const clave = prompt('Nombre de la clave (sin espacios):');
        if (clave) {
            updateConfigValue(clave.toLowerCase().replace(/\s+/g, '_'), '');
        }
    };

    const deleteConfig = async (id: number, clave: string) => {
        if (!confirm(`¿Eliminar la configuración "${clave}"?`)) return;

        try {
            await fetch(`/api/admin/configuracion/${id}`, {
                method: 'DELETE',
            });
            await fetchConfigs();
        } catch (error) {
            console.error('Error deleting config:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-serif font-bold text-foreground">Configuración del Sistema</h1>
                <Button onClick={saveConfigs} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Bank Details */}
            <Card className="p-6">
                <h2 className="text-lg font-medium text-foreground mb-4">💳 Datos Bancarios (Transferencias)</h2>
                <p className="text-sm text-muted-foreground mb-4">Estos datos se mostrarán al usuario cuando seleccione pago por transferencia.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Nombre del Banco</label>
                        <Input
                            value={getConfigValue('banco_nombre')}
                            onChange={(e) => updateConfigValue('banco_nombre', e.target.value)}
                            placeholder="BROU"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Número de Cuenta</label>
                        <Input
                            value={getConfigValue('banco_cuenta')}
                            onChange={(e) => updateConfigValue('banco_cuenta', e.target.value)}
                            placeholder="001-1234567-00001"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Titular de la Cuenta</label>
                        <Input
                            value={getConfigValue('banco_titular')}
                            onChange={(e) => updateConfigValue('banco_titular', e.target.value)}
                            placeholder="CEUTA"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Tipo de Cuenta</label>
                        <Input
                            value={getConfigValue('banco_tipo')}
                            onChange={(e) => updateConfigValue('banco_tipo', e.target.value)}
                            placeholder="Caja de Ahorros"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Moneda</label>
                        <Input
                            value={getConfigValue('banco_moneda')}
                            onChange={(e) => updateConfigValue('banco_moneda', e.target.value)}
                            placeholder="Pesos Uruguayos"
                        />
                    </div>
                </div>
            </Card>

            {/* Cash Payment Details */}
            <Card className="p-6">
                <h2 className="text-lg font-medium text-foreground mb-4">💵 Pagos en Efectivo (Abitab / Red Pagos)</h2>
                <p className="text-sm text-muted-foreground mb-4">Configura cómo los usuarios pueden pagar en efectivo.</p>
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-4">
                        <label className="block text-sm font-medium text-gray-700">Habilitar pago en efectivo</label>
                        <select
                            value={getConfigValue('efectivo_habilitado') || 'true'}
                            onChange={(e) => updateConfigValue('efectivo_habilitado', e.target.value)}
                            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="true">Sí, mostrar opción</option>
                            <option value="false">No, ocultar opción</option>
                        </select>
                    </div>

                    {/* Cuenta bancaria para Abitab/RedPagos */}
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mt-2">
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-3">🏦 Cuenta para depósitos en Abitab/RedPagos</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mb-3">Si usás una cuenta diferente a la de transferencias directas, completá estos campos. Si no, se usará la misma cuenta.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Banco</label>
                                <Input
                                    value={getConfigValue('efectivo_banco_nombre')}
                                    onChange={(e) => updateConfigValue('efectivo_banco_nombre', e.target.value)}
                                    placeholder="BROU (dejar vacío = misma cuenta)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Número de Cuenta</label>
                                <Input
                                    value={getConfigValue('efectivo_banco_cuenta')}
                                    onChange={(e) => updateConfigValue('efectivo_banco_cuenta', e.target.value)}
                                    placeholder="001-1234567-00001"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Titular</label>
                                <Input
                                    value={getConfigValue('efectivo_banco_titular')}
                                    onChange={(e) => updateConfigValue('efectivo_banco_titular', e.target.value)}
                                    placeholder="CEUTA"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Instrucciones para el Usuario</label>
                        <textarea
                            value={getConfigValue('efectivo_instrucciones')}
                            onChange={(e) => updateConfigValue('efectivo_instrucciones', e.target.value)}
                            placeholder="Acercate a cualquier Abitab o Red Pagos y mencioná que querés pagar a CEUTA"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            rows={3}
                        />
                    </div>
                    <div className="md:w-1/2">
                        <label className="block text-sm font-medium text-foreground mb-1">Código de Servicio (opcional)</label>
                        <Input
                            value={getConfigValue('efectivo_codigo')}
                            onChange={(e) => updateConfigValue('efectivo_codigo', e.target.value)}
                            placeholder="Ej: 123456"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Si tenés un código específico de Abitab/RedPagos</p>
                    </div>
                </div>
            </Card>

            {/* Contact Info */}
            <Card className="p-6">
                <h2 className="text-lg font-medium text-foreground mb-4">Información de Contacto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">WhatsApp General (Inscripciones/Pagos)</label>
                        <Input
                            value={getConfigValue('whatsapp_contacto')}
                            onChange={(e) => updateConfigValue('whatsapp_contacto', e.target.value)}
                            placeholder="59898910715"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">WhatsApp Secretaría (Administración)</label>
                        <Input
                            value={getConfigValue('whatsapp_secretaria')}
                            onChange={(e) => updateConfigValue('whatsapp_secretaria', e.target.value)}
                            placeholder="59891431577"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Email de Contacto</label>
                        <Input
                            value={getConfigValue('email_contacto')}
                            onChange={(e) => updateConfigValue('email_contacto', e.target.value)}
                            placeholder="secretaria@ceuta.org.uy"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Dirección</label>
                        <Input
                            value={getConfigValue('direccion')}
                            onChange={(e) => updateConfigValue('direccion', e.target.value)}
                            placeholder="Canelones 1198, Montevideo"
                        />
                    </div>
                </div>
            </Card>Estuve verificando la configuración anterior y eliminando los campos innecesarios. Ahora los campos reflejan correctamente 'whatsapp_contacto' para atención general y 'whatsapp_secretaria' para administración, como solicitaste.

            {/* Other Configs */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-foreground">Otras Configuraciones</h2>
                    <Button variant="outline" size="sm" onClick={addCustomConfig}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar
                    </Button>
                </div>
                <div className="space-y-3">
                    {configs.filter(c => !commonConfigs.some(cc => cc.clave === c.clave)).map((config) => (
                        <div key={config.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700">{config.clave}</p>
                                {config.descripcion && (
                                    <p className="text-xs text-muted-foreground">{config.descripcion}</p>
                                )}
                            </div>
                            <Input
                                value={config.valor}
                                onChange={(e) => updateConfigValue(config.clave, e.target.value)}
                                className="max-w-xs"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteConfig(config.id, config.clave)}
                                className="text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    {configs.filter(c => !commonConfigs.some(cc => cc.clave === c.clave)).length === 0 && (
                        <p className="text-muted-foreground text-center py-4">No hay configuraciones adicionales.</p>
                    )}
                </div>
            </Card>
        </div>
    );
}
