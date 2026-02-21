import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    // 1. Validate Supabase environment variables to prevent crash
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn(
            '⚠️ Supabase environment variables are missing in middleware. Skipping auth check.'
        );
        return NextResponse.next({
            request,
        });
    }

    let supabaseResponse = NextResponse.next({
        request,
    });

    try {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        );
                        supabaseResponse = NextResponse.next({
                            request,
                        });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        // Refresh session if expired
        const {
            data: { user },
        } = await supabase.auth.getUser();

        // Protected admin routes
        if (request.nextUrl.pathname.startsWith('/admin')) {
            // Allow login page
            if (request.nextUrl.pathname === '/admin/login') {
                // If already logged in, redirect to dashboard
                if (user) {
                    const url = request.nextUrl.clone();
                    url.pathname = '/admin/dashboard';
                    return NextResponse.redirect(url);
                }
                return supabaseResponse;
            }

            // Require auth for all other admin routes
            if (!user) {
                const url = request.nextUrl.clone();
                url.pathname = '/admin/login';
                return NextResponse.redirect(url);
            }
        }

        return supabaseResponse;
    } catch (error) {
        console.error('❌ Error in middleware Supabase client:', error);
        // Fail safe: allow request to proceed without auth logic if middleware crashes
        return NextResponse.next({
            request,
        });
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - Public files (images, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
