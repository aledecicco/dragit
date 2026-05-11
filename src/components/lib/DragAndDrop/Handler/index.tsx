import { type PropsWithChildren, useRef } from 'react'
import * as DndSettings from '@dnd-kit/dom'
import * as Dnd from '@dnd-kit/react'

import { DragAndDropBackdrop } from '../Backdrop'
import { DragAndDropIndicator } from '../Indicator'
import { RestrictMovement, SnapToCursor } from '../utils'

interface DragAndDropHandlerProps extends PropsWithChildren {}

/**
 * Provides the app with drag-and-drop functionalities.
 */
const DragAndDropHandler = (props: DragAndDropHandlerProps) => {
  const { children } = props
  const previousFocus = useRef<Element | null>(null)

  return (
    <Dnd.DragDropProvider
      onDragStart={() => {
        previousFocus.current = document.activeElement
      }}
      onDragEnd={() => {
        if (previousFocus.current instanceof HTMLElement) {
          previousFocus.current.focus()
        }
        previousFocus.current = null
      }}
      sensors={[
        DndSettings.PointerSensor.configure({
          activationConstraints: [
            new DndSettings.PointerActivationConstraints.Distance({ value: 5 }),
          ],
          preventActivation: (event, source) => {
            const target = source.handle ?? source.element
            return !target?.contains(event.target as Node)
          },
        }),
        DndSettings.KeyboardSensor.configure({
          offset: 20,
          preventActivation: (event) => {
            return !event.altKey
          },
        }),
      ]}
      modifiers={[SnapToCursor, RestrictMovement]}
      plugins={[
        DndSettings.Accessibility,
        DndSettings.Cursor,
        DndSettings.Feedback.configure({ dropAnimation: null }),
        DndSettings.PreventSelection,
      ]}
    >
      {children}

      <DragAndDropBackdrop />

      <Dnd.DragOverlay
        style={{
          width: 'fit-content',
          height: 'fit-content',
        }}
      >
        {(dragging) => (
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
