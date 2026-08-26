import Link from "next/link";
import { localePath, type Locale } from "@/lib/hdm";
import { CONTACT_EMAIL } from "@/lib/site";

/**
 * Página legal: índice lateral y secciones ancladas.
 *
 * Sin tarjetas: el texto legal se lee mejor en columna continua, y
 * poder enlazar una sección concreta ("mira el punto 3") sirve más que
 * el adorno.
 */
export default function LegalPage({
  locale,
  label,
  title,
  subtitle,
  updated,
  backLabel,
  sections,
}: {
  locale: Locale;
  label: string;
  title: string;
  subtitle: string;
  updated: string;
  backLabel: string;
  sections: readonly { id: string; title: string; body: readonly string[] }[];
}) {
  return (
    <main className="hdm-shell legal-page">
      <Link href={localePath(locale, "/")} className="hdm-back">
        ← {backLabel}
      </Link>

      <header className="legal-hero">
        <div className="hdm-kicker">{label}</div>
        <h1 className="hdm-h2">{title}</h1>
        <p className="legal-subtitle">{subtitle}</p>
        <span className="legal-pill">{updated}</span>
      </header>

      <div className="legal-body">
        <aside className="legal-toc">
          <ol>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </aside>

        <div className="legal-doc">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="legal-section">
              <h2>
                <a href={`#${section.id}`}>{section.title}</a>
              </h2>
              {section.body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </section>
          ))}

          <footer className="legal-foot">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </footer>
        </div>
      </div>
    </main>
  );
}
