import type { Configuration } from "lint-staged"

export default {
  "*.{ts,tsx}": ["oxfmt", "oxlint --fix"],
  "*.{json,jsonc,md}": ["oxfmt"],
} satisfies Configuration
