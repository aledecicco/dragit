import { Tooltip } from 'radix-ui'
import React from 'react'
import ReactDOM from 'react-dom/client'

import '@fontsource/inter'

import './main.css'
import { ClientProvider } from '@api/client'
import { EventHandler } from '@api/events'
import { App } from './app'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ClientProvider>
      <EventHandler>
        <Tooltip.Provider>
          <App />
        </Tooltip.Provider>
      </EventHandler>
    </ClientProvider>
  </React.StrictMode>,
)
