/**
 * CUSTOM CLIENT ENTRY — src/client.tsx   (optional file)
 * ----------------------------------------------------------------------------
 * This is the first code that runs in the browser. It hydrates the
 * server-rendered HTML document with <StartClient />, which boots the router
 * on the client so further navigations happen without full page reloads.
 *
 * If you delete this file Start uses an identical default. You'd customise it
 * to add global error boundaries, analytics, polyfills, etc.
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/client-entry-point
 */
import { StartClient } from '@tanstack/react-start/client'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

hydrateRoot(
  document,
  <StrictMode>
    <StartClient />
  </StrictMode>,
)
