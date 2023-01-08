import { Component, createEffect, createSignal, Show } from 'solid-js'
import QRCode from 'qrcode-generator'
import { Scene } from './Scene'
import s from './modals.module.css'

export const Lobby: Component<{ gameId: string }> = props => {
  const [qrCode, setQrCode] = createSignal<string>()

  createEffect(() => {
    const qr = QRCode(4, 'L')
    qr.addData(`https://secrethitler.live/player?game=${props.gameId}`)
    qr.make()
    setQrCode(qr.createDataURL(20, 40))
  }, [props.gameId])

  return (
    <Scene>
      <p class={s.Subtitle}>
        Go to <strong>secrethitler.live</strong> and enter room code
      </p>
      <p class={s.RoomCode}>{props.gameId}</p>
      <p class={s.Subtitle}>or scan the QR code</p>
      <Show when={qrCode()}>
        <img class={s.QrCode} src={qrCode()!} />
      </Show>
    </Scene>
  )
}
