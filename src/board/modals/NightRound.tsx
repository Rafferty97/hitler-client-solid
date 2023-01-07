import { Component } from 'solid-js'
import { Scene } from './Scene'
import { useSound } from '../../util/hooks'
import { sound } from '../../util/sound'
import s from './modals.module.css'
import secretRoleUrl from '../../assets/sound/secret role.mp3'

const secretRole = sound(secretRoleUrl)

export const NightRound: Component = () => {
  useSound(secretRole, () => true)

  return (
    <Scene>
      <h1 class={s.Title}>Night round</h1>
      <p class={s.Subtitle}>You have now been given your secret role</p>
    </Scene>
  )
}
