type ApiClientOptions = {
  baseUrl: string
}

type RequestOptions = {
  method?: "GET" | "POST"
  body?: unknown
  signal?: AbortSignal
}

export class ApiClient {
  constructor(private readonly options: ApiClientOptions) {}

  get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "GET" })
  }

  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "POST", body })
  }

  private async request<T>(path: string, options: RequestOptions) {
    const response = await fetch(`${this.options.baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    })

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    return response.json() as Promise<T>
  }
}
