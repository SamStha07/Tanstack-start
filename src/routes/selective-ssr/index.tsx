/**
 * src/routes/selective-ssr/index.tsx  →  "/selective-ssr"
 */
import { createFileRoute } from '@tanstack/react-router'
import { Explain } from '~/components/FeaturePage'

export const Route = createFileRoute('/selective-ssr/')({
  component: () => (
    <Explain title="Which mode when?">
      <table>
        <thead>
          <tr>
            <th>ssr</th>
            <th>beforeLoad/loader on server?</th>
            <th>component HTML on server?</th>
            <th>use when…</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>true</code></td>
            <td>yes</td>
            <td>yes</td>
            <td>default — best for SEO & first paint</td>
          </tr>
          <tr>
            <td><code>&apos;data-only&apos;</code></td>
            <td>yes</td>
            <td>no</td>
            <td>component needs browser APIs (canvas, charts, maps)</td>
          </tr>
          <tr>
            <td><code>false</code></td>
            <td>no</td>
            <td>no</td>
            <td>loader needs browser APIs (localStorage, IndexedDB)</td>
          </tr>
        </tbody>
      </table>
      <p>Open each tab above. Each shows where its loader ran and where its component was first rendered.</p>
    </Explain>
  ),
})
