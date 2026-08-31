# zai-coding-plan-proxy-workers

## Core Concepts

GLM Coding PlanをCloudflare OS → AI Gatewayで使用するとき、2つの問題がある。

### 1. モデルIDの不整合

Cloudflare OSは入力されたモデルIDをfull lengthで扱うため、上流プロバイダーにprovider prefixが流れてしまう。
そのため、上流プロバイダーは `"custom-zai/glm-5.3-flash"` というモデルIDを理解できない。

### 2. パスの不整合

Z.ai Coding Planの OpenAI Chat Completions 形式のbase URLは `https://api.z.ai/api/coding/paas/v4` であり、推論エンドポイントは `https://api.z.ai/api/coding/paas/v4/chat/completions` である。
一方、Cloudflare OSは `/chat/completions` を利用する。
AI Gatewayは `/chat/completions` へのリクエストを `/v1/chat/completions` に流すため、設定で解決できないパスの不整合が発生する。

| カスタムプロバイダーのbase URL | Z.ai Coding Planへのリクエスト | 結果 |
| `https://api.z.ai/api/coding/paas` |`/v1/chat/completions` | `404 Not Found` |
| `https://api.z.ai/api/coding/paas/v4` |`/v4/v1/chat/completions` | `404 Not Found` |

### 解決策

これらの問題を解決するため、このWorkerでは以下の2点を処理する。

1. provider suffixの除去: 1つ目の `/` までの文字列を除去する。
2. パスの書き換え: `/api/v1/chat/completions` を `https://api.z.ai/api/coding/paas/v4/chat/completions` に書き換える。

`.model` 以外のリクエストボディフィールド、およびヘッダーなど認証情報は全てパススルーされる。
また `/api/anthropic` や `/api/v1` など `/api` 以下全てのリクエストは、処理[1]のみを適用しパススルーする。
