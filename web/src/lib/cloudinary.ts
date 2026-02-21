import { v2 as cloudinary } from 'cloudinary';

// Validate required environment variables
function validateConfig() {
    const required = [
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Cloudinary configuration incomplete. Missing: ${missing.join(', ')}. ` +
            `Add these to your .env.local file.`
        );
    }
}

// Configure Cloudinary with environment variables
function getCloudinaryConfig() {
    validateConfig();

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    return cloudinary;
}

// Valid upload folders matching the existing structure
export const UPLOAD_FOLDERS = {
    'cursos/portadas': 'ceuta/cursos/portadas',
    'cursos/heroes': 'ceuta/cursos/heroes',
    'docentes': 'ceuta/docentes',
    'testimonios': 'ceuta/testimonios',
    'comprobantes': 'ceuta/comprobantes',
} as const;

export type UploadFolder = keyof typeof UPLOAD_FOLDERS;

export function isValidFolder(folder: string): folder is UploadFolder {
    return folder in UPLOAD_FOLDERS;
}

interface UploadResult {
    url: string;
    publicId: string;
}

/**
 * Upload an image buffer to Cloudinary
 */
export async function uploadImage(
    buffer: Buffer,
    folder: UploadFolder,
    filename?: string
): Promise<UploadResult> {
    const client = getCloudinaryConfig();
    const cloudinaryFolder = UPLOAD_FOLDERS[folder];

    return new Promise((resolve, reject) => {
        const uploadStream = client.uploader.upload_stream(
            {
                folder: cloudinaryFolder,
                public_id: filename,
                resource_type: 'image',
                // Auto optimize for web
                transformation: [
                    { quality: 'auto', fetch_format: 'auto' }
                ],
            },
            (error, result) => {
                if (error || !result) {
                    reject(error || new Error('Upload failed'));
                    return;
                }
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        uploadStream.end(buffer);
    });
}

/**
 * Delete an image from Cloudinary by public_id
 */
export async function deleteImage(publicId: string): Promise<void> {
    const client = getCloudinaryConfig();
    await client.uploader.destroy(publicId);
}

/**
 * Upload any file (image or PDF) to Cloudinary
 * Used for payment receipts which can be images or PDFs
 */
export async function uploadFile(
    buffer: Buffer,
    folder: string,
    filename?: string,
    resourceType: 'image' | 'raw' | 'auto' = 'auto'
): Promise<UploadResult> {
    const client = getCloudinaryConfig();

    return new Promise((resolve, reject) => {
        const uploadStream = client.uploader.upload_stream(
            {
                folder,
                public_id: filename,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error || !result) {
                    reject(error || new Error('Upload failed'));
                    return;
                }
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        uploadStream.end(buffer);
    });
}

export default cloudinary;
