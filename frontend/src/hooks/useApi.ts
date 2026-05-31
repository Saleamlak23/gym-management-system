import { useState, useCallback, useRef } from 'react'

// ── Types ─────────────────────────────────────────────────

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiReturn<T, A extends unknown[]> extends ApiState<T> {
  execute: (...args: A) => Promise<T>
  reset: () => void
  setData: React.Dispatch<React.SetStateAction<T | null>>
}

// ── Hook ──────────────────────────────────────────────────

/**
 * useApi — wraps an async service function with managed
 * loading, error, and data state.
 *
 * Generic params:
 *   T  — the resolved data type
 *   A  — the argument tuple of the service function
 *
 * Usage:
 *   const { data, loading, error, execute } = useApi(getMembers)
 *
 *   useEffect(() => {
 *     execute({ search: '' })
 *   }, [execute])
 */
export function useApi<T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>,
): UseApiReturn<T, A> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  // Track whether the component is still mounted to avoid
  // setting state after unmount on slow network responses.
  const mountedRef = useRef(true)
  useState(() => {
    return () => {
      mountedRef.current = false
    }
  })

  const execute = useCallback(
    async (...args: A): Promise<T> => {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const result = await fn(...args)
        if (mountedRef.current) {
          setState({ data: result, loading: false, error: null })
        }
        return result
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Something went wrong'
        if (mountedRef.current) {
          setState({ data: null, loading: false, error: message })
        }
        throw err
      }
    },
    [fn],
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  const setData = useCallback<React.Dispatch<React.SetStateAction<T | null>>>(
    (value) => {
      setState((s) => ({
        ...s,
        data: typeof value === 'function'
          ? (value as (prev: T | null) => T | null)(s.data)
          : value,
      }))
    },
    [],
  )

  return {
    data:    state.data,
    loading: state.loading,
    error:   state.error,
    execute,
    reset,
    setData,
  }
}