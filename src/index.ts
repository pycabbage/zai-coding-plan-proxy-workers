import { Hono } from "hono"

const app = new Hono<Env>()

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>
