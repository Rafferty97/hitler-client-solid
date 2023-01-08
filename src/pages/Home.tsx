import { A } from '@solidjs/router'
import { Component } from 'solid-js'
import s from './Home.module.css'

const HomePage: Component = () => {
  return (
    <div>
      <h1>Secret Hitler</h1>
      <A href="/console">CONSOLE</A>
    </div>
  )
}

export default HomePage
