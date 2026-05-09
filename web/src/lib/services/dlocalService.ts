import crypto from 'crypto';

// ============================================================
// dLocal Go Service - Centralized payment logic
// ============================================================

interface DLocalConfig {
    apiKey: string;
    secretKey: string;
    baseUrl: string;
    environment: 'sandbox' | 'live';
}

export interface CreatePaymentParams {
    amount: number;
    currency?: string;
    country?: string;
    orderId: string;
    description: string;
    successUrl: string;
    backUrl: string;
    notificationUrl: string;
    payer?: {
        name?: string;
        email?: string;
        phone?: string;
        document_type?: string;
        document?: string;
    };
}

export interface DLocalPaymentResponse {
    id: string;
    amount: number;
    currency: string;
    country: string;
    description: string;
    created_date: string;
    status: string;
    order_id: string;
    notification_url: string;
    success_url: string;
    back_url: string;
    redirect_url: string;
    merchant_checkout_token: string;
    direct: boolean;
}

export interface DLocalRetrievedPayment {
    id: string;
    amount: number;
    currency: string;
    country: string;
    description: string;
    created_date: string;
    status: string;
    order_id: string;
    notification_url: string;
    success_url: string;
    back_url: string;
    payer?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    payment_method_id?: string;
    payment_method_type?: string;
    [key: string]: unknown;
}

/**
 * Returns the dLocal configuration from environment variables.
 * Throws if required env vars are missing.
 */
export function getDLocalConfig(): DLocalConfig {
    const apiKey = process.env.DLOCAL_API_KEY;
    const secretKey = process.env.DLOCAL_SECRET_KEY;
    const environment = (process.env.DLOCAL_ENVIRONMENT || 'sandbox') as 'sandbox' | 'live';

    if (!apiKey || !secretKey) {
        throw new Error(
            'dLocal Go configuration missing. Set DLOCAL_API_KEY and DLOCAL_SECRET_KEY environment variables.'
        );
    }

    const baseUrl = environment === 'live'
        ? 'https://api.dlocalgo.com'
        : 'https://api-sbx.dlocalgo.com';

    return { apiKey, secretKey, baseUrl, environment };
}

/**
 * Build the Authorization header for dLocal Go API.
 * Format: "Bearer API_KEY:SECRET_KEY"
 */
function buildAuthHeader(config: DLocalConfig): string {
    return `Bearer ${config.apiKey}:${config.secretKey}`;
}

/**
 * Create a payment in dLocal Go.
 * Returns the payment response including the redirect_url.
 */
export async function createPayment(
    params: CreatePaymentParams
): Promise<DLocalPaymentResponse> {
    const config = getDLocalConfig();

    const body = {
        amount: params.amount,
        currency: params.currency || 'UYU',
        country: params.country || 'UY',
        order_id: params.orderId,
        description: params.description,
        success_url: params.successUrl,
        back_url: params.backUrl,
        notification_url: params.notificationUrl,
        ...(params.payer && { payer: params.payer }),
    };

    const response = await fetch(`${config.baseUrl}/v1/payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': buildAuthHeader(config),
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[dLocal] Create payment error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
        });
        throw new Error(
            `dLocal payment creation failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        );
    }

    const data: DLocalPaymentResponse = await response.json();
    console.log('[dLocal] Payment created:', {
        id: data.id,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        order_id: data.order_id,
    });

    return data;
}

/**
 * Retrieve a payment from dLocal Go by its payment ID.
 */
export async function retrievePayment(
    paymentId: string
): Promise<DLocalRetrievedPayment> {
    const config = getDLocalConfig();

    const response = await fetch(`${config.baseUrl}/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': buildAuthHeader(config),
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[dLocal] Retrieve payment error:', {
            status: response.status,
            paymentId,
            error: errorData,
        });
        throw new Error(
            `dLocal payment retrieval failed: ${response.status} - ${JSON.stringify(errorData)}`
        );
    }

    return await response.json();
}

/**
 * Validate a webhook notification signature using HMAC-SHA256.
 * 
 * dLocal sends:
 *   Authorization: "V2-HMAC-SHA256, Signature: <signature>"
 * 
 * To verify:
 *   message = apiKey + rawBody
 *   expected = HMAC-SHA256(message, secretKey)
 *   Compare expected with received signature
 */
export function validateWebhookSignature(
    rawBody: string,
    receivedAuthHeader: string
): boolean {
    try {
        const config = getDLocalConfig();

        // Extract signature from header: "V2-HMAC-SHA256, Signature: <sig>"
        const match = receivedAuthHeader.match(/Signature:\s*(\S+)/);
        if (!match) {
            console.error('[dLocal] Webhook: no signature found in Authorization header');
            return false;
        }
        const receivedSignature = match[1];

        // Calculate expected signature: HMAC-SHA256(apiKey + body, secretKey)
        const message = config.apiKey + rawBody;
        const expectedSignature = crypto
            .createHmac('sha256', config.secretKey)
            .update(message)
            .digest('hex');

        // Timing-safe comparison to prevent timing attacks
        const receivedBuffer = Buffer.from(receivedSignature, 'hex');
        const expectedBuffer = Buffer.from(expectedSignature, 'hex');

        if (receivedBuffer.length !== expectedBuffer.length) {
            console.error('[dLocal] Webhook: signature length mismatch');
            return false;
        }

        const isValid = crypto.timingSafeEqual(receivedBuffer, expectedBuffer);

        if (!isValid) {
            console.error('[dLocal] Webhook: signature mismatch', {
                received: receivedSignature.substring(0, 16) + '...',
                expected: expectedSignature.substring(0, 16) + '...',
            });
        }

        return isValid;
    } catch (error) {
        console.error('[dLocal] Webhook signature validation error:', error);
        return false;
    }
}

/**
 * Generate a unique order ID for dLocal payments.
 * Format: CEUTA-{inscriptoId}-{timestamp}
 */
export function generateOrderId(inscriptoId: number): string {
    const timestamp = Date.now();
    return `CEUTA-${inscriptoId}-${timestamp}`;
}
