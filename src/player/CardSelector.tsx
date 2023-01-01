import { Component, createSignal, Index, Switch, Match } from 'solid-js'
import { Motion } from '@motionone/solid'
import { Party } from '../dm/role'
import { Button } from './Button'
import ps from './PlayerApp.module.css'
import s from './CardSelector.module.css'

const NO_CARD = 99

interface Props {
  policies: Party[]
  veto: boolean
  onChoose: (index: number) => void
  onVeto: () => void
}

export const CardSelector: Component<Props> = props => {
  const [discarded, setDiscarded] = createSignal(NO_CARD)
  const scale = () =>
    [0, 0, 1.2, 1][props.policies.length - (discarded() == NO_CARD ? 0 : 1)]
  const offset = () =>
    [0, 0, -0.6, -1][props.policies.length - (discarded() == NO_CARD ? 0 : 1)]

  return (
    <>
      <p class={ps.Message}>
        {discarded() == NO_CARD ? (
          <>
            Choose a policy to <strong>discard</strong>
          </>
        ) : props.policies.length > 2 ? (
          'Play these policies?'
        ) : (
          'Play this policy?'
        )}
      </p>
      <div class={s.CardSelector}>
        <Index each={props.policies}>
          {(policy, idx) => (
            <CardSelectorCard
              policy={policy()}
              n={scale() * (idx - (idx > discarded() ? 1 : 0)) + offset()}
              hidden={idx === discarded()}
              choose={() => setDiscarded(p => (p == NO_CARD ? idx : p))}
            />
          )}
        </Index>
      </div>
      <div class={s.Buttons}>
        <Switch>
          <Match when={discarded() != NO_CARD}>
            <Button
              black
              noPadding
              label="undo"
              onClick={() => setDiscarded(NO_CARD)}
            />
            <Button
              yellow
              noPadding
              label="confirm"
              onClick={() => props.onChoose(discarded())}
            />
          </Match>
        </Switch>
      </div>
      {/* <div className="undo-confirm">
        {discarded == 10 ? (
          props.veto && (
            <button
              className="btn veto"
              onClick={() => props.send({ type: 'veto' })}
            >
              Veto Agenda
            </button>
          )
        ) : (
          <>
            <button className="btn undo" onClick={() => setDiscarded(10)}>
              Undo
            </button>
            <button
              className="btn confirm"
              onClick={() => props.send({ type: 'discard', idx: discarded })}
            >
              Confirm
            </button>
          </>
        )}
      </div> */}
    </>
  )
}

interface CardProps {
  policy: Party
  n: number
  hidden: boolean
  choose: () => void
}

const CardSelectorCard: Component<CardProps> = props => {
  // const { r, o } = useSpring({ r: props.n, o: props.hidden ? 0 : 1 })
  // return (
  //   <animated.div
  //     onClick={() => props.choose()}
  //     style={{
  //       transform: interpolate(
  //         [r, o],
  //         (r, o) =>
  //           `rotate(${10 * r}deg) translate(${80 * r}px, ${160 * (1 - o)}px)`
  //       ),
  //       opacity: o,
  //     }}
  //     className={`policy-card ${props.party.toLowerCase()}`}
  //   />
  // )
  return (
    <Motion.div
      onClick={props.choose}
      class={`${s.PolicyCard} ${s[props.policy]}`}
      animate={{
        transform: `rotate(${10 * props.n}deg) translate(${80 * props.n}px, ${
          props.hidden ? 160 : 0
        }px)`,
        opacity: props.hidden ? 0 : 1,
      }}
      transition={{ duration: 0.4 }}
    />
  )
}
