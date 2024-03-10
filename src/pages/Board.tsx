import { useSearchParams } from '@solidjs/router'
import { Component, createEffect } from 'solid-js'
import { PrefetchImages } from '../components/Prefetch'
import { BoardApp } from '../board/BoardApp'
import s from './Board.module.css'

const BoardPage: Component = () => {
  const [params, setParams] = useSearchParams()

  const join = (game: string) => setParams({ game })

  createEffect(() => {
    setParams({ create: null })
  })

  return (
    <div class={s.BoardPage}>
      <PrefetchImages />
      <BoardApp gameId={params.game} onJoin={join} create={params.create === 'true'} />
    </div>
  )
}

export default BoardPage
