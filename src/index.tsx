/* @refresh reload */
import { render } from 'solid-js/web'
import { Route, Router, Routes } from '@solidjs/router'
import HomePage from './pages/Home'
import BoardPage from './pages/Board'
import PlayerPage from './pages/Player'
import ConsolePage from './pages/Console'
import './index.css'

render(
  () => (
    <Router base={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" component={HomePage} />
        <Route path="/board" component={BoardPage} />
        <Route path="/player" component={PlayerPage} />
        <Route path="/console" component={ConsolePage} />
      </Routes>
    </Router>
  ),
  document.getElementById('root') as HTMLElement
)
