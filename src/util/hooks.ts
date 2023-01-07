import { Accessor, createEffect, createMemo, createSignal, onCleanup } from 'solid-js'

export function useDelay(value: Accessor<boolean>, delay: number): Accessor<boolean> {
  const [output, setOutput] = createSignal(false)

  createEffect(() => {
    if (value()) {
      const timeout = setTimeout(() => setOutput(true), delay)
      onCleanup(() => clearTimeout(timeout))
    } else {
      setOutput(() => false)
    }
  })

  return output
}

// export function useDelay<T>(
//   value: Accessor<T>,
//   delay: number | ((value: T) => number | undefined)
// ): Accessor<T> {
//   const [output, setOutput] = createSignal(value())

//   createEffect(() => {
//     const value_ = value()
//     const delay_ = typeof delay === 'number' ? delay : delay(value_)
//     if (delay_ && delay_ > 0) {
//       const timeout = setTimeout(() => setOutput(() => value_), delay_)
//       onCleanup(() => clearTimeout(timeout))
//     } else {
//       setOutput(() => value_)
//     }
//   })

//   return output
// }

export function useSound(audio: HTMLAudioElement, play: Accessor<boolean>) {
  const play_ = createMemo(play)
  createEffect(() => {
    if (!play_()) return
    audio.play()
    onCleanup(() => {
      audio.pause()
      audio.currentTime = 0
    })
  })
}

export function useDynamicSound(audio: Accessor<HTMLAudioElement | undefined>) {
  const audio_ = createMemo(audio)
  createEffect(() => {
    const audio = audio_()
    if (!audio) return
    audio.play()
    onCleanup(() => {
      audio.pause()
      audio.currentTime = 0
    })
  })
}
