import { onCleanup } from 'solid-js'

export function useTimeout(fn: () => void, delay: number) {
  const timeout = setTimeout(fn, delay)
  onCleanup(() => clearTimeout(timeout))
}
