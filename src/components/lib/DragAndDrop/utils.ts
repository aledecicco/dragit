import * as DndTypes from '@dnd-kit/abstract'
import type * as DndSettings from '@dnd-kit/dom'
import * as Dnd from '@dnd-kit/react'

import type {
  BranchInfo,
  NotStagedFile,
  StagedFile,
  StashInfo,
  TagInfo,
} from '@/api/models'
import type { Glyph } from '@/ui/Icon'

type Coordinates = {
  x: number
  y: number
}

class SnapCenterToCursor extends DndTypes.Modifier {
  public apply(operation: DndTypes.DragOperation): Coordinates {
    if (
      operation.activatorEvent instanceof MouseEvent &&
      operation.activatorEvent.target instanceof HTMLElement
    ) {
      return {
        x: operation.transform.x + operation.activatorEvent.offsetX,
        y: operation.transform.y + operation.activatorEvent.offsetY,
      }
    }

    return operation.transform
  }
}

interface DragDef<T extends string, D> {
  type: T

  label: string

  Glyph: Glyph

  dragged: D
}

type DragType =
  | DragDef<'not-staged-files', NotStagedFile[]>
  | DragDef<'staged-files', StagedFile[]>
  | DragDef<'branch', BranchInfo>
  | DragDef<'tag', TagInfo>
  | DragDef<'stash', StashInfo>

const useDraggable = Dnd.useDraggable<DragType>

const useDroppable = Dnd.useDroppable<DragType>

type Draggable = DndSettings.Draggable<DragType> & { data: DragType }
type Droppable = DndSettings.Droppable<DragType>

const useBeforeDrag = (
  callback: (args: { element: HTMLElement; source: Draggable }) => void,
) => {
  Dnd.useDragDropMonitor({
    onBeforeDragStart: (event) => {
      const element = event.operation.source?.element
      const source = event.operation.source as Draggable | null

      if (element instanceof HTMLElement && source) {
        callback({
          element,
          source,
        })
      }
    },
  })
}

const useOnDrop = (
  callback: (args: { source: Draggable; target: Droppable }) => void,
) => {
  Dnd.useDragDropMonitor({
    onDragEnd: (event) => {
      if (event.canceled) {
        return
      }

      const source = event.operation.source as Draggable | null
      const target = event.operation.target as Droppable | null

      if (source && target) {
        callback({
          source,
          target,
        })
      }
    },
  })
}

export {
  useDraggable,
  useDroppable,
  useBeforeDrag,
  useOnDrop,
  SnapCenterToCursor,
  type DragType,
  type Draggable,
}
