/**
 * FORMS & FORMDATA — src/routes/forms.tsx  →  "/forms"
 * ============================================================================
 * Server functions accept `FormData` directly. That means a plain HTML
 * <form> can submit to a server function:
 *
 *   const submit = createServerFn({ method: 'POST' })
 *     .validator((data) => {
 *       if (!(data instanceof FormData)) throw new Error('Expected FormData')
 *       return { name: String(data.get('name') ?? '') }
 *     })
 *     .handler(async ({ data }) => …)
 *
 *   <form onSubmit={(e) => { e.preventDefault(); submit({ data: new FormData(e.currentTarget) }) }}>
 *
 * FormData also works for FILE UPLOADS: `data.get('file')` is a `File`.
 *
 * The validator converts the loosely-typed FormData into a typed object, so
 * the handler's `data` is fully typed. Here we validate with zod after
 * reading the fields and return field errors to show next to inputs.
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
 */
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { z } from 'zod'
import { Code, Demo, FeaturePage } from '~/components/FeaturePage'
import { sleep } from '~/server/db.server'

const signupSchema = z.object({
  name: z.string().trim().min(2, 'At least 2 characters'),
  email: z.email('Not a valid email'),
  plan: z.enum(['free', 'pro']),
  avatar: z.instanceof(File).optional(),
})

const submitSignup = createServerFn({ method: 'POST' })
  .validator((data) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData')
    const file = data.get('avatar')
    // Turn FormData into a plain object, then let zod validate it.
    return {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      plan: String(data.get('plan') ?? ''),
      avatar: file instanceof File && file.size > 0 ? file : undefined,
    }
  })
  .handler(async ({ data }) => {
    await sleep(300)
    const parsed = signupSchema.safeParse(data)
    if (!parsed.success) {
      // Return field errors as data instead of throwing, so the UI can show them inline.
      return { ok: false as const, errors: z.flattenError(parsed.error).fieldErrors }
    }
    const { avatar, ...user } = parsed.data
    return {
      ok: true as const,
      user,
      file: avatar ? { name: avatar.name, size: avatar.size, type: avatar.type } : null,
    }
  })

export const Route = createFileRoute('/forms')({
  component: FormsPage,
})

function FormsPage() {
  const submit = useServerFn(submitSignup)
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitSignup>> | null>(null)
  const [pending, setPending] = useState(false)
  const errors = result && !result.ok ? result.errors : {}

  return (
    <FeaturePage
      title="Forms & FormData"
      file="src/routes/forms.tsx"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/server-functions"
      intro={<p>Send a native form (including a file) straight to a server function.</p>}
    >
      <Demo title="Sign-up form → server function">
        <form
          className="stack"
          method="post"
          encType="multipart/form-data"
          onSubmit={async (e) => {
            e.preventDefault()
            setPending(true)
            setResult(await submit({ data: new FormData(e.currentTarget) }))
            setPending(false)
          }}
        >
          <label>
            Name <input name="name" />
            {errors.name && <small style={{ color: 'var(--danger)' }}> {errors.name[0]}</small>}
          </label>
          <label>
            Email <input name="email" />
            {errors.email && <small style={{ color: 'var(--danger)' }}> {errors.email[0]}</small>}
          </label>
          <label>
            Plan{' '}
            <select name="plan" defaultValue="free">
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>
          </label>
          <label>
            Avatar (optional) <input type="file" name="avatar" />
          </label>
          <button disabled={pending}>{pending ? 'Submitting…' : 'Submit'}</button>
        </form>
        {result?.ok && (
          <div className="card">
            ✅ Welcome {result.user.name}! Server received:
            <Code>{JSON.stringify(result, null, 2)}</Code>
          </div>
        )}
      </Demo>
      <Code>{`
const submitSignup = createServerFn({ method: 'POST' })
  .validator((data) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData')
    return { name: String(data.get('name')), avatar: data.get('avatar') }
  })
  .handler(async ({ data }) => { ... })

<form onSubmit={(e) => { e.preventDefault(); submit({ data: new FormData(e.currentTarget) }) }}>
      `}</Code>
    </FeaturePage>
  )
}
