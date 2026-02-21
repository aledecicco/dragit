import type { PropsWithChildren } from 'react'
import * as DndSettings from '@dnd-kit/dom'
import * as Dnd from '@dnd-kit/react'

import { DragAndDropIndicator } from '../Indicator'
import { type Draggable, SnapToCursor } from '../utils'

type DragAndDropHandlerProps = PropsWithChildren

/**
 * Provides the app with drag-and-drop functionalities
 */
const DragAndDropHandler = (props: DragAndDropHandlerProps) => {
  const { children } = props

  return (
    <Dnd.DragDropProvider
      modifiers={[SnapToCursor.configure({})]}
      plugins={[
        DndSettings.Accessibility,
        DndSettings.Cursor,
        DndSettings.Feedback.configure({ dropAnimation: null }),
        DndSettings.PreventSelection,
      ]}
    >
      {children}

      <Dnd.DragOverlay>
        {(dragging: Draggable) => (
          <DragAndDropIndicator
            Glyph={dragging.data.Glyph}
            label={dragging.data.label}
          />
        )}
      </Dnd.DragOverlay>
    </Dnd.DragDropProvider>
  )
}

export { DragAndDropHandler, type DragAndDropHandlerProps }
