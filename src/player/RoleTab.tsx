import { Motion } from '@motionone/solid'
import { Component, createEffect, createSignal, onCleanup } from 'solid-js'
import { Role } from '../dm/role'
import s from './PlayerApp.module.css'

export const RoleTab: Component<{ role: Role }> = props => {
  const [open, setOpen] = createSignal(false)

  createEffect(() => {
    if (open()) {
      const timer = setTimeout(() => setOpen(false), 4000)
      onCleanup(() => clearTimeout(timer))
    }
  })

  return (
    <div class={s.RoleTab}>
      <Motion.div
        animate={{
          transform: open() ? 'translate(0, 0)' : 'translate(0, 40px)',
        }}
      >
        <div class={s.Tab} onClick={() => setOpen(!open())}>
          Secret Role
        </div>
        <div class={s.Role} onClick={() => setOpen(false)}>
          {props.role}
        </div>
      </Motion.div>
    </div>
  )
}
