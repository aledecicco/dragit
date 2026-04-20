import { scan } from 'react-scan'
import React from 'react'
import ReactDOM from 'react-dom/client'

import '@fontsource/inter/100'
import '@fontsource/inter/200'
import '@fontsource/inter/300'
import '@fontsource/inter/400'
import '@fontsource/inter/500'
import '@fontsource/inter/600'
import '@fontsource/inter/700'
import '@fontsource/inter/800'
import '@fontsource/inter/900'
import './main.css'

import { ClientProvider } from '@/api/client'
import { DragAndDropHandler } from '@/lib/DragAndDrop/Handler'
import { ShortcutsHandler } from '@/lib/Shortcuts/Handler'

import { App } from './app'

scan({
  enabled: true,
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ClientProvider>
      <ShortcutsHandler>
        <DragAndDropHandler>
          <App />
        </DragAndDropHandler>
      </ShortcutsHandler>
    </ClientProvider>
  </React.StrictMode>,
)
