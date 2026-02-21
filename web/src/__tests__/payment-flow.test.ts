
import { POST as createPreference } from '@/app/api/payments/mercadopago/preference/route';
import { POST as uploadComprobante } from '@/app/api/inscripcion/comprobante/route';
import { POST as verifyComprobante } from '@/app/api/admin/inscriptos/[id]/verificar/route';
import { createAdminClient } from '@/lib/supabase/server';
import { Preference } from 'mercadopago';
import { uploadFile } from '@/lib/cloudinary';
import { sendPaymentStatusEmail, cancelScheduledEmails } from '@/lib/services/emailService';

// --- MOCKS ---

jest.mock('@/lib/supabase/server', () => ({
    createAdminClient: jest.fn(),
    createClient: jest.fn(),
}));

jest.mock('mercadopago', () => ({
    MercadoPagoConfig: jest.fn(),
    Preference: jest.fn(),
}));

jest.mock('@/lib/cloudinary', () => ({
    uploadFile: jest.fn(),
    UPLOAD_FOLDERS: { comprobantes: 'comprobantes' },
}));

jest.mock('@/lib/services/emailService', () => ({
    sendPaymentStatusEmail: jest.fn(),
    cancelScheduledEmails: jest.fn(),
}));

// Full mock of next/server to avoid runtime dependency issues in JSDOM
jest.mock('next/server', () => ({
    NextRequest: class {
        url: string;
        method: string;
        body: any;
        nextUrl: any;
        constructor(url: string, init?: any) {
            this.url = url;
            this.method = init?.method || 'GET';
            this.body = init?.body;
            this.nextUrl = { origin: 'http://localhost' };
        }
        async formData() {
            return this.body;
        }
        async json() {
            return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
        }
    },
    NextResponse: {
        json: jest.fn((body, init) => ({ body, init })),
    },
}));

const { NextRequest } = require('next/server');

// --- TESTS ---

describe('Payment System Tests', () => {
    const mockSupabase = {
        from: jest.fn(),
        select: jest.fn(),
        eq: jest.fn(),
        single: jest.fn(),
        update: jest.fn(),
        auth: { getUser: jest.fn() },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (createAdminClient as jest.Mock).mockReturnValue(mockSupabase);
        mockSupabase.from.mockReturnThis();
        mockSupabase.select.mockReturnThis();
        mockSupabase.eq.mockReturnThis();
        mockSupabase.single.mockReturnThis(); // Returns this, so await resolves to mockSupabase
        mockSupabase.update.mockReturnThis(); // Returns this, so chaining .eq works

        // Default "clean" behaviors
        // For simple selects that just await single():
        mockSupabase.single.mockResolvedValue({ data: {}, error: null });

        // For auth
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin_1' } } });
    });

    describe('1. Payment Preference Creation', () => {
        it('should create preference for valid course', async () => {
            // Setup Supabase response for course
            mockSupabase.single.mockResolvedValue({
                data: { nombre: 'Curso Test', precio: 1000 },
                error: null
            });

            // Mock MP Preference.create
            const mockCreate = jest.fn().mockResolvedValue({
                id: 'pref_123',
                init_point: 'https://mp.com/checkout'
            });
            (Preference as unknown as jest.Mock).mockImplementation(() => ({
                create: mockCreate
            }));

            const req = new NextRequest('http://api/payments', {
                method: 'POST',
                body: { courseId: 1, enrollmentId: 100 } // Pass object directly since our mock supports it
            });

            process.env.MP_ACCESS_TOKEN = 'test_token';

            const response = await createPreference(req);

            // @ts-ignore
            expect(response.body).toEqual(expect.objectContaining({
                success: true,
                init_point: 'https://mp.com/checkout',
                preference_id: 'pref_123'
            }));
        });

        it('should return 400 if courseId is missing', async () => {
            const req = new NextRequest('http://api/payments', {
                method: 'POST',
                body: {}
            });

            const response = await createPreference(req);
            // @ts-ignore
            expect(response.init.status).toBe(400);
        });
    });

    describe('2. Proof Upload', () => {
        it('should upload valid file', async () => {
            const formData = new Map();
            const file = {
                name: 'test.png',
                type: 'image/png',
                size: 1000,
                arrayBuffer: async () => Buffer.from('test')
            };
            formData.set('file', file);
            formData.set('token', 'valid_token');

            const req = new NextRequest('http://api/upload', {
                method: 'POST',
                body: formData
            });

            // Mock finding enrollment by token
            // We need to ensure logic flow: 
            // 1. select(...).eq().single() -> returns enrollment
            // 2. update(...).eq() -> returns success

            mockSupabase.single.mockResolvedValueOnce({
                data: { id: 10, nombre: 'Juan', curso_id: 1, estado: 'pendiente' },
                error: null
            });

            (uploadFile as jest.Mock).mockResolvedValue({
                url: 'https://cloudinary.com/image.png'
            });

            // Ensure update().eq() chain works
            // The code awaits the result of eq().
            // So we need eq() to return { error: null } specifically for the UPDATE call.
            // But we configured eq() to return THIS globally.
            // So await resolves to mockSupabase.
            // mockSupabase does not have 'error' property. So error is undefined. Success.

            const response = await uploadComprobante(req);

            // @ts-ignore
            expect(response.body).toHaveProperty('success', true);
            // @ts-ignore
            expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
                estado: 'pago_a_verificar',
                comprobante_url: 'https://cloudinary.com/image.png'
            }));
        });
    });

    describe('3. Admin Verification', () => {
        it('should verify enrollment and trigger emails', async () => {
            const params = Promise.resolve({ id: '10' });
            const req = new NextRequest('http://api/verify', { method: 'POST' });

            // Mock checking existence
            mockSupabase.single.mockResolvedValueOnce({
                data: { id: 10, nombre: 'Juan', email: 'juan@test.com' },
                error: null
            });

            // Mock auth user
            const mockAuth = { auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin_1' } } }) } };
            // We need to inject this mock into creaetClient default export or named export
            // My mock of @/lib/supabase/server exports createClient.
            // @ts-ignore
            const { createClient } = require('@/lib/supabase/server');
            createClient.mockReturnValue(mockAuth);

            const response = await verifyComprobante(req, { params });

            // @ts-ignore
            expect(response.body).toHaveProperty('success', true);
            expect(cancelScheduledEmails).toHaveBeenCalledWith(10);
            expect(sendPaymentStatusEmail).toHaveBeenCalledWith(10, 'approved');
        });
    });
});
