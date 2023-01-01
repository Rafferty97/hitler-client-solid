/* @refresh reload */
import { render } from 'solid-js/web'
import { Router } from '@solidjs/router'
import App from './App'
import './index.css'
import { PrefetchImages } from './components/Prefetch'

render(
  () => (
    <Router>
      <PrefetchImages />
      <App />
    </Router>
  ),
  document.getElementById('root') as HTMLElement
)
