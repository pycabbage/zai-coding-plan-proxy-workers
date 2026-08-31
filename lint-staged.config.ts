import type { Configuration } from "lint-staged"

export default {
  "*.{ts,tsx,json,jsonc,md}": ["oxfmt", "oxlint --fix"],
} satisfies Configuration
