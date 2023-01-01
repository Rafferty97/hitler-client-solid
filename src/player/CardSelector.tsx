import { Component, createSignal, Index, Switch, Match } from 'solid-js'
import { Motion } from '@motionone/solid'
import { Party } from '../dm/role'
import { Button } from './Button'
import ps from './PlayerApp.module.css'
import s from './CardSelector.module.css'

interface CardSelectorProps {
  policies: Party[]
  canVeto: boolean
  onChoose: (index: number) => void
  onVeto: () => void
}

export const CardSelector: Component<CardSelectorProps> = props => {
  const [discarded, setDiscarded] = createSignal<number>()

  return (
    <>
      <p class={ps.Message}>
        {discarded() == null ? (
          <>
            Choose a policy to <strong>discard</strong>
          </>
        ) : props.policies.length > 2 ? (
          'Play these policies?'
        ) : (
          'Play this policy?'
        )}
      </p>
      <CardSet
        policies={props.policies}
        discarded={discarded()}
        onClick={idx => setDiscarded(i => (i == null ? idx : i))}
      />
      <div class={s.Buttons}>
        <Switch>
          <Match when={discarded() == null && props.canVeto}>
            <div class={s.CentreButton}>
              <Button red noPadding label="Veto agenda" onClick={props.onVeto} />
            </div>
          </Match>
          <Match when={discarded() != null}>
            <Button black noPadding label="Undo" onClick={() => setDiscarded(undefined)} />
            <Button yellow noPadding label="Confirm" onClick={() => props.onChoose(discarded()!)} />
          </Match>
        </Switch>
      </div>
    </>
  )
}

interface PolicyPeakProps {
  policies: Party[]
  onDone: () => void
}

export const PolicyPeak: Component<PolicyPeakProps> = props => {
  const [revealed, setRevealed] = createSignal(false)

  return (
    <>
      <p class={ps.Message}>
        Click to reveal the
        <br />
        <strong>top three policy cards</strong>
      </p>
      <div class={s.QuestionMark}>?</div>
      <CardSet policies={revealed() ? props.policies : []} />
      <div class={s.Buttons}>
        <div class={s.CentreButton}>
          <Switch>
            <Match when={revealed()}>
              <Button yellow noPadding label="Done" onClick={props.onDone} />
            </Match>
            <Match when={!revealed()}>
              <Button red noPadding label="Reveal cards" onClick={() => setRevealed(true)} />
            </Match>
          </Switch>
        </div>
      </div>
    </>
  )
}

interface CardSetProps {
  policies: Party[]
  discarded?: number
  onClick?: (index: number) => void
}

const CardSet: Component<CardSetProps> = props => {
  const scale = () => [0, 0, 1.2, 1][props.policies.length - (props.discarded == null ? 0 : 1)]
  const offset = () => [0, 0, -0.6, -1][props.policies.length - (props.discarded == null ? 0 : 1)]

  return (
    <div class={s.CardSelector}>
      <Index each={props.policies}>
        {(policy, idx) => (
          <Card
            policy={policy()}
            n={scale() * (idx - (idx > (props.discarded ?? 99) ? 1 : 0)) + offset()}
            hidden={idx === props.discarded}
            choose={() => props.onClick?.(idx)}
          />
        )}
      </Index>
    </div>
  )
}

interface CardProps {
  policy: Party
  n: number
  hidden: boolean
  choose: () => void
}

const Card: Component<CardProps> = props => {
  return (
    <Motion.div
      onClick={props.choose}
      class={`${s.PolicyCard} ${s[props.policy]}`}
      animate={{
        transform: `rotate(${10 * props.n}deg) translate(${80 * props.n}px, ${props.hidden ? 160 : 0}px)`,
        opacity: props.hidden ? 0 : 1,
      }}
      initial={{
        transform: `rotate(${15 * props.n}deg) translate(${80 * props.n}px, 120px)`,
        opacity: 0,
      }}
      transition={{ duration: 0.35 }}
    />
  )
}
