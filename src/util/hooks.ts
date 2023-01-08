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
