import { scan } from 'react-scan'
import React from 'react'
import ReactDOM from 'react-dom/client'

import '@fontsource/inter'
import './main.css'

import { ClientProvider } from '@/api/client'
import { DragAndDropHandler } from '@/lib/DragAndDrop/Handler'

import { App } from './app'

scan({
  enabled: true,
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ClientProvider>
      <DragAndDropHandler>
        <App />
      </DragAndDropHandler>
    </ClientProvider>
  </React.StrictMode>,
)
