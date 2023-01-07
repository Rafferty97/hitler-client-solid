import { Component, JSX } from 'solid-js'
import { Motion } from '@motionone/solid'
import s from './modals.module.css'

export const Scene: Component<{ children: JSX.Element }> = props => (
  <Motion.div
    class={s.Scene}
    initial={{ transform: 'translate(0, 100%)' }}
    animate={{ transform: 'translate(0, 0%)' }}
    exit={{ transform: 'translate(0, -100%)' }}
    transition={{ duration: 0.75 }}
  >
    {props.children}
  </Motion.div>
)
