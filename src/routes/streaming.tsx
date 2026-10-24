/**
 * STREAMING SERVER FUNCTIONS — src/routes/streaming.tsx  →  "/streaming"
 * ============================================================================
 * A server function can stream its result chunk by chunk — perfect for AI
 * chat responses, progress updates, logs …  Two ways:
 *
 * 1. ASYNC GENERATOR (cleanest):
 *      createServerFn().handler(async function* () { yield chunk })
 *    Caller:  for await (const chunk of await fn()) { … }
 *
 * 2. ReadableStream<T>:
 *      createServerFn().handler(() => new ReadableStream<T>({ start(c) { c.enqueue(chunk) } }))
 *    Caller:  const reader = (await fn()).getReader(); await reader.read()
 *
 * In both cases the chunks are TYPED end-to-end and arrive as soon as the
 * server produces them.
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/guide/streaming-data-from-server-functions
 */
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { z } from 'zod'
import { Code, Demo, FeaturePage } from '~/components/FeaturePage'
import { sleep } from '~/server/db.server'

type Token = { text: string; index: number }

const answer =
  'TanStack Start streams this sentence to you word by word, the way an AI chat would, using an async generator inside a server function.'

// 1. Async generator: every `yield` is sent to the client immediately.
const streamWords = createServerFn({ method: 'GET' })
  .validator(z.object({ delayMs: z.number().min(10).max(500) }))
  .handler(async function* ({ data }) {
    const words = answer.split(' ')
    for (let i = 0; i < words.length; i++) {
      await sleep(data.delayMs)
      yield { text: words[i] + ' ', index: i } satisfies Token
    }
  })

// 2. ReadableStream with typed chunks.
const streamProgress = createServerFn({ method: 'GET' }).handler(() => {
  return new ReadableStream<{ percent: number; step: string }>({
    async start(controller) {
      const steps = ['Fetching data', 'Crunching numbers', 'Rendering report', 'Uploading', 'Done']
      for (let i = 0; i < steps.length; i++) {
        await sleep(500)
        controller.enqueue({ percent: ((i + 1) / steps.length) * 100, step: steps[i] })
      }
      controller.close()
    },
  })
})

export const Route = createFileRoute('/streaming')({
  component: StreamingPage,
})

function StreamingPage() {
  const [text, setText] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [progress, setProgress] = useState<{ percent: number; step: string } | null>(null)

  async function runGenerator() {
    setText('')
    setStreaming(true)
    // `chunk` is typed as Token
    for await (const chunk of await streamWords({ data: { delayMs: 80 } })) {
      setText((prev) => prev + chunk.text)
    }
    setStreaming(false)
  }

  async function runReadableStream() {
    setProgress({ percent: 0, step: 'Starting' })
    const stream = await streamProgress()
    const reader = stream.getReader()
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      setProgress(value)
    }
  }

  return (
    <FeaturePage
      title="Streaming server functions"
      file="src/routes/streaming.tsx"
      docs="https://tanstack.com/start/latest/docs/framework/react/guide/streaming-data-from-server-functions"
      intro={<p>Typed chunks pushed from the server as they are produced.</p>}
    >
      <Demo title="1. Async generator (AI-chat style)">
        <button onClick={runGenerator} disabled={streaming}>
          {streaming ? 'Streaming…' : 'Ask the server'}
        </button>
        <p className="card" style={{ minHeight: '3rem' }}>
          {text}
          {streaming && '▍'}
        </p>
      </Demo>
      <Demo title="2. ReadableStream (progress updates)">
        <button onClick={runReadableStream}>Start job</button>
        {progress && (
          <div style={{ marginTop: 8 }}>
            <progress value={progress.percent} max={100} style={{ width: '100%' }} />
            <p>
              {progress.percent}% — {progress.step}
            </p>
          </div>
        )}
      </Demo>
      <Code>{`
const streamWords = createServerFn().handler(async function* () {
  for (const word of words) { await sleep(80); yield { text: word } }
})

for await (const chunk of await streamWords()) setText((t) => t + chunk.text)
      `}</Code>
    </FeaturePage>
  )
}
