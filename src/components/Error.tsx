import { Motion, Presence } from 'solid-motionone'
import { Component, createEffect, createSignal, onCleanup, Show } from 'solid-js'
import s from './Error.module.css'

interface Props {
  error?: string
  timeout?: number
}

export const Error: Component<Props> = props => {
  const [error, setError] = createSignal(props.error)

  createEffect(() => {
    const e = props.error
    setError(e)
    if (e) {
      const t = setTimeout(() => setError(undefined), props.timeout ?? 5000)
      onCleanup(() => clearTimeout(t))
    }
  })

  return (
    <Presence exitBeforeEnter>
      <Show when={error() != null}>
        <Motion.div
          initial={{ transform: 'translate(0, 20px)', opacity: 0 }}
          animate={{ transform: 'translate(0, 0)', opacity: 1 }}
          exit={{ transform: 'translate(0, 20px)', opacity: 0 }}
          class={s.Error}
        >
          {error()}
        </Motion.div>
      </Show>
    </Presence>
  )
}
