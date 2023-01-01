import { Component, createEffect } from 'solid-js'
import liberalPolicy from '../assets/liberal_article.png'
import fascistPolicy from '../assets/fascist_article.png'
import communistPolicy from '../assets/communist_article.png'

export const PrefetchImages: Component = () => {
  createEffect(() => {
    for (const src of [liberalPolicy, fascistPolicy, communistPolicy]) {
      const img = new Image()
      img.src = src
    }
  })

  return <></>
}
