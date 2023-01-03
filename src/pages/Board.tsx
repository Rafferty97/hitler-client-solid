import { useSearchParams } from '@solidjs/router'
import { Component } from 'solid-js'
import { PrefetchImages } from '../components/Prefetch'
import { BoardApp } from '../board/BoardApp'
import s from './Board.module.css'

const BoardPage: Component = () => {
  const [params, setParams] = useSearchParams()

  const join = (game: string) => setParams({ game })
  const exit = () => setParams({ game: '' })

  return (
    <div class={s.BoardPage}>
      <PrefetchImages />
      <BoardApp gameId={params.game} onJoin={join} onExit={exit} />
    </div>
  )
}

export default BoardPage
