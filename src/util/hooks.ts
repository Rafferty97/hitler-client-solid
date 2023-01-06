import { Accessor, createEffect, createSignal, onCleanup } from 'solid-js'

export function useDelay<T>(value: Accessor<T>, delay: (value: T) => number | undefined): Accessor<T> {
  const [output, setOutput] = createSignal(value())

  createEffect(() => {
    const value_ = value()
    const delay_ = delay(value_)
    if (delay_ && delay_ > 0) {
      const timeout = setTimeout(() => setOutput(() => value_), delay_)
      onCleanup(() => clearTimeout(timeout))
    } else {
      setOutput(() => value_)
    }
  })

  return output
}

export function useSound(sound: HTMLAudioElement, play: boolean) {
  createEffect(() => {
    if (!play) return
    sound.play()
    onCleanup(() => {
      sound.pause()
      sound.currentTime = 0
    })
  })
}
