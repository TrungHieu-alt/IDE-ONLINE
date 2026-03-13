export type DataSourceMode = "mock" | "http"

function resolveDataSourceMode(value: string | undefined): DataSourceMode {
  return value === "http" ? "http" : "mock"
}

export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api",
  dataSourceMode: resolveDataSourceMode(import.meta.env.VITE_DATA_SOURCE_MODE),
} as const
