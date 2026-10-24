/**
 * Sidebar navigation built from src/features.ts.
 *
 * `<Link>` renders a normal <a href> (so it works before JS loads and for
 * crawlers) but intercepts clicks to do client-side navigation.
 * `activeProps` are merged onto the link when its route is active.
 */
import { Link } from '@tanstack/react-router'
import { featureSections } from '../features'

export function Sidebar() {
  return (
    <nav className="sidebar">
      <Link to="/" className="brand" activeOptions={{ exact: true }}>
        🏝️ TanStack Start
        <small>learn by reading the code</small>
      </Link>
      {featureSections.map((section) => (
        <div key={section.title} className="nav-section">
          <div className="nav-section-title">{section.title}</div>
          {section.items.map((item) => (
            <Link key={item.to} to={item.to} activeProps={{ className: 'active' }}>
              {item.title}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  )
}
