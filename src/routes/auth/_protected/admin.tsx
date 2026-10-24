/**
 * src/routes/auth/_protected/admin.tsx  →  "/auth/admin"
 *
 * Role-based access: beforeLoad checks the role for UX (nice error page),
 * and the server function is protected by adminMiddleware for security.
 */
import { createFileRoute } from '@tanstack/react-router'
import { Demo } from '~/components/FeaturePage'
import { getAdminReport } from '~/utils/auth.functions'

export const Route = createFileRoute('/auth/_protected/admin')({
  beforeLoad: ({ context }) => {
    if (context.user.role !== 'admin') {
      throw new Error(`Hi ${context.user.name}, this page is for admins only. Log in as admin@example.com.`)
    }
  },
  loader: () => getAdminReport(),
  errorComponent: ({ error }) => (
    <div className="error-box">
      <h2>403 — Forbidden</h2>
      <p>{error instanceof Error ? error.message : String(error)}</p>
    </div>
  ),
  component: AdminPage,
})

function AdminPage() {
  const { users } = Route.useLoaderData()
  return (
    <Demo title="Admin: all users">
      <table>
        <thead>
          <tr>
            <th>id</th>
            <th>name</th>
            <th>email</th>
            <th>role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Demo>
  )
}
