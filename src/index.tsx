/* @refresh reload */
import { render } from 'solid-js/web'
import { Route, Router, Routes } from '@solidjs/router'
import HomePage from './pages/Home'
import PlayerPage from './pages/Player'
import ConsolePage from './pages/Console'
import './index.css'

render(
  () => (
    <Router>
      <Routes>
        <Route path="/" component={HomePage} />
        <Route path="/player" component={PlayerPage} />
        <Route path="/console" component={ConsolePage} />
      </Routes>
    </Router>
  ),
  document.getElementById('root') as HTMLElement
)
