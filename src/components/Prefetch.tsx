import { Component, createEffect } from 'solid-js'
import liberalPolicy from '../assets/liberal_article.png'
import fascistPolicy from '../assets/fascist_article.png'
import communistPolicy from '../assets/communist_article.png'
import liberalParty from '../assets/liberal_party.png'
import fascistParty from '../assets/fascist_party.png'
import communistParty from '../assets/communist_party.png'

const images = [liberalPolicy, fascistPolicy, communistPolicy, liberalParty, fascistParty, communistParty]

export const PrefetchImages: Component = () => {
  createEffect(() => {
    for (const src of images) {
      const img = new Image()
      img.src = src
    }
  })

  return <></>
}
