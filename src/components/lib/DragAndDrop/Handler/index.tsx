import type { PropsWithChildren } from 'react'
import * as DndSettings from '@dnd-kit/dom'
import * as Dnd from '@dnd-kit/react'

import { DragAndDropIndicator } from '../Indicator'
import { RestrictMovement, SnapToCursor } from '../utils'

type DragAndDropHandlerProps = PropsWithChildren

/**
 * Provides the app with drag-and-drop functionalities
 */
const DragAndDropHandler = (props: DragAndDropHandlerProps) => {
  const { children } = props

  return (
    <Dnd.DragDropProvider
      sensors={[
        DndSettings.PointerSensor.configure({
          activationConstraints: [
            new DndSettings.PointerActivationConstraints.Distance({ value: 5 }),
          ],
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
