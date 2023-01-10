import { Component, createEffect } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { createWs } from '../ws'
import { PlayerApp } from '../player/PlayerApp'
import { validateGameId } from '../validate'
import { PrefetchImages } from '../components/Prefetch'
import { BoardApp } from '../board/BoardApp'

/*
  Centrist = 7 or more
  Monarchist (if you do it) = 8 or more
  Capitalist & Anarchist = 9 or more
*/

const ConsolePage: Component = () => {
  const [params, setParams] = useSearchParams()
  const gameId = () => params.game ?? ''
  const setGameId = (game: string) => setParams({ game })
  const ws = createWs()

  createEffect(() => {
    const gameId_ = validateGameId(gameId())
    if (gameId_) {
      ws.joinAsBoard(gameId_)
    } else {
      ws.leave()
    }
  })

  createEffect(() => {
    const gameId_ = ws.gameId()
    if (gameId_) setGameId(gameId_)
  })

  const players = ['ALEX', 'BOB', 'CHARLIE', 'DAVID', 'EDDY'] //, 'FRED', 'GEORGE', 'IJ', 'JACK', 'KAREN']

  const noop = () => {}

  return (
    <div>
      <PrefetchImages />
      <div style={{ position: 'relative', background: '#222', height: '650px', margin: '0 0 40px' }}>
        <BoardApp gameId={gameId()} onJoin={setGameId} />
      </div>
      <div style={{ display: 'flex', 'flex-wrap': 'wrap', margin: '40px 0' }}>
        {players.map(player => (
          <div
            style={{
              flex: '1 0 280px',
              height: '520px',
              border: '2px solid white',
              background: '#222',
              overflow: 'hidden',
            }}
          >
            <PlayerApp name={player} gameId={gameId()} onJoin={noop} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ConsolePage
