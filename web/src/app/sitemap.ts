import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://ceuta-cursos.vercel.app';
    const supabase = await createClient();

    // Fetch active courses
    const { data: cursos } = await supabase
        .from('cursos')
        .select('slug, updated_at')
        .eq('activo', true);

    const courseUrls: MetadataRoute.Sitemap = (cursos || []).map((curso) => ({
        url: `${baseUrl}/cursos/${curso.slug}`,
        lastModified: curso.updated_at ? new Date(curso.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/cursos`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        ...courseUrls,
    ];
}
