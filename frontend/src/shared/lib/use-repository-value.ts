import { useEffect, useMemo, useState } from "react"

import type { MaybePromise } from "@/shared/types/async"

type RepositoryValueState<T> = {
  data: T | null
  error: Error | null
  isLoading: boolean
}

function isPromiseLike<T>(value: MaybePromise<T>): value is Promise<T> {
  return typeof (value as Promise<T>).then === "function"
}

export function useRepositoryValue<T>(loader: () => MaybePromise<T>, dependencies: readonly unknown[]) {
  const result = useMemo(loader, dependencies)
  const [state, setState] = useState<RepositoryValueState<T>>(() => {
    if (isPromiseLike(result)) {
      return {
        data: null,
        error: null,
        isLoading: true,
      }
    }

    return {
      data: result,
      error: null,
      isLoading: false,
    }
  })

  useEffect(() => {
    if (!isPromiseLike(result)) {
      setState({
        data: result,
        error: null,
        isLoading: false,
      })
      return
    }

    let isCancelled = false

    setState((current) => ({
      data: current.data,
      error: null,
      isLoading: true,
    }))

    result
      .then((value) => {
        if (!isCancelled) {
          setState({
            data: value,
            error: null,
            isLoading: false,
          })
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setState({
            data: null,
            error: error instanceof Error ? error : new Error("Unknown repository error"),
            isLoading: false,
          })
        }
      })

    return () => {
      isCancelled = true
    }
  }, [result])

  return state
}
