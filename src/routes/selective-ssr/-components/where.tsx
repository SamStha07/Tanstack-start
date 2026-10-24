/**
 * Shared helpers for the selective SSR demos ("-components" is ignored by
 * the router because it starts with "-").
 */
import { createIsomorphicFn } from '@tanstack/react-start'
import type { ReactNode } from 'react'

/** Returns 'server' or 'browser' depending on where it is called. */
export const where = createIsomorphicFn()
  .server(() => 'server' as const)
  .client(() => 'browser' as const)

export function Report(props: { loaderRanOn: string; componentRenderedOn: string; extra?: ReactNode }) {
  return (
    <table>
      <tbody>
        <tr>
          <th>loader ran on</th>
          <td>{props.loaderRanOn}</td>
        </tr>
        <tr>
          <th>component first rendered on</th>
          <td>{props.componentRenderedOn}</td>
        </tr>
        {props.extra}
      </tbody>
    </table>
  )
}
