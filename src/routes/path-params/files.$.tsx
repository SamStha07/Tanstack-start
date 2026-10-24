/**
 * src/routes/path-params/files.$.tsx  →  "/path-params/files/*"
 *
 * A file named `$` (here `files.$.tsx`) is a SPLAT route: it matches
 * everything after /path-params/files/, including slashes. The matched part
 * is available as `params._splat`.
 */
import { Link, createFileRoute } from '@tanstack/react-router'
import { FeaturePage } from '~/components/FeaturePage'

export const Route = createFileRoute('/path-params/files/$')({
  component: FilesPage,
})

function FilesPage() {
  const { _splat } = Route.useParams()
  const segments = (_splat ?? '').split('/').filter(Boolean)
  return (
    <FeaturePage
      title="Splat route"
      file="src/routes/path-params/files.$.tsx"
      intro={
        <p>
          <code>params._splat</code> = <code>{JSON.stringify(_splat)}</code>
        </p>
      }
    >
      <p>Segments:</p>
      <ol>
        {segments.map((s, i) => (
          <li key={i}>
            <code>{s}</code>
          </li>
        ))}
      </ol>
      <Link to="/path-params">← back</Link>
    </FeaturePage>
  )
}
