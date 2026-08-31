import { Hono } from "hono"

const ZAI_ORIGIN = "https://api.z.ai"
const CHAT_COMPLETIONS_PATH = "/api/v1/chat/completions"
const CHAT_COMPLETIONS_URL = `${ZAI_ORIGIN}/api/coding/paas/v4/chat/completions`

const app = new Hono<Env>()

app.all("/api/*", async (c) => {
  const { pathname, search } = new URL(c.req.url)
  const url =
    pathname === CHAT_COMPLETIONS_PATH ? CHAT_COMPLETIONS_URL : `${ZAI_ORIGIN}${pathname}${search}`

  const headers = new Headers(c.req.raw.headers)
  headers.delete("content-length")

  let body: BodyInit | null = null
  if (!["GET", "HEAD"].includes(c.req.method)) {
    if (c.req.header("content-type")?.includes("application/json")) {
      const json = await c.req.json<{ model?: string }>()
      if (typeof json.model === "string") json.model = json.model.replace(/^[^/]*\//, "")
      body = JSON.stringify(json)
    } else {
      body = await c.req.raw.arrayBuffer()
    }
  }

  return fetch(url, { method: c.req.method, headers, body })
})

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>
