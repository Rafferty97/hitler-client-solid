import { Motion, Presence } from 'solid-motionone'
import { Component, For } from 'solid-js'
import s from './modals.module.css'

export const AnimatedSubtitle: Component<{ text?: string }> = props => {
  return (
    <div class={s.Subtitle}>
      <Presence>
        <For each={props.text == null ? [] : [props.text]}>
          {text => (
            <Motion.div
              initial={{ opacity: 0, transform: 'translate(0, 120%)' }}
              animate={{ opacity: 1, transform: 'translate(0, 0)' }}
              exit={{ opacity: 0, transform: 'translate(0, -120%)' }}
              transition={{ duration: 0.3 }}
            >
              {text}
            </Motion.div>
          )}
        </For>
      </Presence>
    </div>
  )
}
