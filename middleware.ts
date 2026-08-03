import { NextResponse, type NextRequest } from "next/server";

/**
 * El español vive en la raíz (`/`, `/car/abc`) y el inglés en `/en/...`.
 *
 * Internamente TODO se resuelve contra `app/[locale]/`, así que aquí
 * reescribimos las rutas sin prefijo hacia `/es/...` sin tocar la URL
 * que ve el usuario. Los links ya compartidos siguen funcionando.
 *
 * Si alguien entra a `/es/algo` (por ejemplo desde un link viejo o mal
 * escrito) lo mandamos con 308 a `/algo` para no tener dos URLs con el
 * mismo contenido, que es lo que penaliza Google.
 */

const LOCALES = ["es", "en"];
const DEFAULT_LOCALE = "es";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /es/... → redirigir a la versión sin prefijo
  if (pathname === `/${DEFAULT_LOCALE}` || pathname.startsWith(`/${DEFAULT_LOCALE}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${DEFAULT_LOCALE}`.length) || "/";
    return NextResponse.redirect(url, 308);
  }

  // /en/... → ya tiene su prefijo, pasa directo
  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (hasLocale) return NextResponse.next();

  // Cualquier otra ruta se resuelve como español, sin cambiar la URL
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Excluye API, assets de Next y cualquier archivo con extensión
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
