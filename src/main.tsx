import { TooltipProvider } from '@radix-ui/react-tooltip'
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
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </EventHandler>
    </ClientProvider>
  </React.StrictMode>,
)
