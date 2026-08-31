import { Hono } from "hono"
import { renderer } from "./renderer"

const ZAI_ORIGIN = "https://api.z.ai"
const CHAT_COMPLETIONS_PATH = "/api/v1/chat/completions"
const CHAT_COMPLETIONS_URL = `${ZAI_ORIGIN}/api/coding/paas/v4/chat/completions`

const app = new Hono<Env>()

app.use(renderer)

app.get("/", async (c) => {
  return c.render(
    <div class="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div class="max-w-xl space-y-4 text-slate-300">
        <h1 class="text-2xl font-semibold text-slate-100">zai-coding-plan-proxy-workers</h1>
        <p class="leading-relaxed">
          使用方法:{" "}
          <a
            class="text-emerald-400 underline underline-offset-2"
            href="https://dash.cloudflare.com/?to=/:account/ai/ai-gateway/custom-providers"
          >
            https://dash.cloudflare.com/?to=/:account/ai/ai-gateway/custom-providers
          </a>{" "}
          で新しいカスタムプロバイダーを定義し、{" "}
          <span class="text-slate-100">
            https://zai-coding-plan-proxy-workers.pycabbage.workers.dev/
          </span>{" "}
          をURLに指定する
        </p>
        <p class="leading-relaxed">APIキーなどは全てAI Gateway側のものをパススルーする</p>
        <p>
          <a
            class="text-emerald-400 underline underline-offset-2"
            href="https://github.com/pycabbage/zai-coding-plan-proxy-workers"
          >
            https://github.com/pycabbage/zai-coding-plan-proxy-workers
          </a>
        </p>
      </div>
    </div>
  )
})

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
