# zai-coding-plan-proxy-workers

## Core Concepts

When using the GLM Coding Plan through Cloudflare AI Gateway's custom providers, there are two problems.

### 1. Model ID mismatch

Cloudflare AI Gateway forwards the model ID it receives at full length, so the provider prefix leaks through to the upstream provider.
As a result, the upstream provider cannot understand a model ID such as `"custom-zai/glm-5.3-flash"`.

### 2. Path mismatch

The base URL for the Z.ai Coding Plan's OpenAI Chat Completions format is `https://api.z.ai/api/coding/paas/v4`, and its inference endpoint is `https://api.z.ai/api/coding/paas/v4/chat/completions`.
Cloudflare AI Gateway, on the other hand, uses `/chat/completions`.
AI Gateway forwards requests to `/chat/completions` as `/v1/chat/completions`, which creates a path mismatch that cannot be resolved through configuration alone.

| Custom provider base URL | Request to Z.ai Coding Plan | Result |
| `https://api.z.ai/api/coding/paas` |`/v1/chat/completions` | `404 Not Found` |
| `https://api.z.ai/api/coding/paas/v4` |`/v4/v1/chat/completions` | `404 Not Found` |

### Solution

To resolve these issues, this Worker handles the following two things.

1. Strip the provider suffix: remove everything up to and including the first `/`.
2. Rewrite the path: rewrite `/api/v1/chat/completions` to `https://api.z.ai/api/coding/paas/v4/chat/completions`.

All request body fields other than `.model`, as well as authentication information such as headers, are passed through unchanged.
Any request under `/api` other than the chat completions path (e.g. `/api/anthropic`, `/api/v1`) only has step [1] applied and is otherwise passed through as-is.

## Usage

1. Create a new [custom provider](https://dash.cloudflare.com/?to=/:account/ai/ai-gateway/custom-providers).
2. Set the custom provider's base URL to `https://zai-coding-plan-proxy-workers.pycabbage.workers.dev/api`.
