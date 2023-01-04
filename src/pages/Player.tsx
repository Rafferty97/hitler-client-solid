import { useSearchParams } from '@solidjs/router'
import { Component } from 'solid-js'
import { PrefetchImages } from '../components/Prefetch'
import { PlayerApp } from '../player/PlayerApp'
import s from './Player.module.css'

const PlayerPage: Component = () => {
  const [params, setParams] = useSearchParams()

  const join = (game: string, name: string) => setParams({ game, name })

  return (
    <div class={s.PlayerPage}>
      <PrefetchImages />
      <PlayerApp gameId={params.game} name={params.name} onJoin={join} />
    </div>
  )
}

export default PlayerPage
