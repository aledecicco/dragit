import { scan } from 'react-scan'

import React from 'react'
import ReactDOM from 'react-dom/client'

import '@fontsource/inter'
import './main.css'

import { ClientProvider } from '@api/client'
import { EventHandler } from '@api/events'
import { App } from './app'

scan({
  enabled: true,
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ClientProvider>
      <EventHandler>
        <App />
      </EventHandler>
    </ClientProvider>
  </React.StrictMode>,
)
