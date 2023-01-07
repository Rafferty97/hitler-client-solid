import { Component } from 'solid-js'
import { Scene } from './Scene'
import s from './modals.module.css'

export const NightRound: Component = () => {
  return (
    <Scene>
      <h1 class={s.Title}>Night round</h1>
      <p class={s.Subtitle}>You have now been given your secret role</p>
    </Scene>
  )
}
