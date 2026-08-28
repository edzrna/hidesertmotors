import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, localePath } from "@/lib/hdm";
import { getDictionary } from "@/i18n/dictionaries";
import { getListingDictionary } from "@/i18n/listing";
import { getListingForEdit } from "@/lib/listings-db";
import EditListingView from "@/components/EditListingView";

/**
 * Página de edición. Se resuelve en cada visita: nunca se guarda en
 * caché una página que depende de un token secreto.
 */
export const dynamic = "force-dynamic";

/** Fuera de los buscadores: la URL lleva la credencial. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Params = Promise<{ locale: string; id: string }>;
type Search = Promise<{ t?: string }>;

export default async function EditPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();

  const { t: token } = await searchParams;

  const dict = getDictionary(locale);
  const texts = getListingDictionary(locale);

  const listing = token ? await getListingForEdit(id, token) : null;

  if (!listing) {
    return (
      <div className="theme-light">
      <main className="hdm-shell hdm-detail">
        <div className="pub-done">
          <h2>{texts.form.edit.notFound}</h2>
          <p>{texts.form.edit.notFoundBody}</p>
          <Link
            href={localePath(locale, "/")}
            className="hdm-btn hdm-btn--primary hdm-btn--block"
          >
            {dict.vehicle.back}
          </Link>
        </div>
      </main>
      </div>
    );
  }

  return (
    <div className="theme-light">
      <EditListingView
      locale={locale}
      dict={dict}
      t={texts}
      listing={listing}
        token={token!}
      />
    </div>
  );
}
