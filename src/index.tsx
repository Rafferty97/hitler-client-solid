/* @refresh reload */
import { render } from 'solid-js/web'
import { Route, Router } from '@solidjs/router'
import BoardPage from './pages/Board'
import PlayerPage from './pages/Player'
import ConsolePage from './pages/Console'
import './index.css'

render(
  () => (
    <Router base={import.meta.env.BASE_URL} explicitLinks>
      <Route path="/board" component={BoardPage} />
      <Route path="/player" component={PlayerPage} />
      <Route path="/console" component={ConsolePage} />
    </Router>
  ),
  document.getElementById('root') as HTMLElement
)
