/**
 * src/routes/path-params/{-$lang}.about.tsx
 *   → "/path-params/about"  AND  "/path-params/<lang>/about"
 *
 * `{-$lang}` is an OPTIONAL path param. It may be present or absent;
 * `params.lang` is typed as `string | undefined`.
 */
import { Link, createFileRoute } from '@tanstack/react-router'
import { FeaturePage } from '~/components/FeaturePage'

const greetings: Record<string, string> = { en: 'Hello!', fr: 'Bonjour !', es: '¡Hola!', ne: 'नमस्ते!' }

export const Route = createFileRoute('/path-params/{-$lang}/about')({
  component: About,
})

function About() {
  const { lang } = Route.useParams()
  return (
    <FeaturePage
      title="Optional param"
      file="src/routes/path-params/{-$lang}.about.tsx"
      intro={
        <p>
          <code>params.lang</code> = <code>{JSON.stringify(lang)}</code>
        </p>
      }
    >
      <p style={{ fontSize: '2rem' }}>{greetings[lang ?? 'en'] ?? `(no greeting for "${lang}")`}</p>
      <div className="row">
        {[undefined, 'fr', 'es', 'ne'].map((l) => (
          <Link key={l ?? 'none'} to="/path-params/{-$lang}/about" params={{ lang: l }} activeOptions={{ exact: true }} activeProps={{ style: { fontWeight: 700 } }}>
            {l ?? '(none)'}
          </Link>
        ))}
      </div>
    </FeaturePage>
  )
}
