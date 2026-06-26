import * as DndTypes from '@dnd-kit/abstract'
import * as DndCollision from '@dnd-kit/collision'
import type * as DndSettings from '@dnd-kit/dom'
import * as Dnd from '@dnd-kit/react'

import type {
  BranchInfo,
  CommitInfo,
  NotStagedFile,
  StagedFile,
  StashInfo,
  TagInfo,
} from '@/api/models'
import type { Glyph } from '@/ui/Icon'
import { clamp } from '@/utils/number'

type Coordinates = {
  x: number
  y: number
}

/**
 * A modifier that snaps the drag overlay to the cursor position.
 */
class SnapToCursor extends DndTypes.Modifier {
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

type DragPayload =
  | DragDef<'not-staged-files', NotStagedFile[]>
  | DragDef<'staged-files', StagedFile[]>
  | DragDef<'branch', BranchInfo>
  | DragDef<'branches', BranchInfo[]>
  | DragDef<'tag', TagInfo>
  | DragDef<'tags', TagInfo[]>
  | DragDef<'stash', StashInfo>
  | DragDef<'stashes', StashInfo[]>
  | DragDef<'commit', CommitInfo>
  | DragDef<'worktree', undefined>
  | DragDef<'index', { fromDraft: boolean }>

type DragType = DragPayload['type']

type MatchingPayload<T extends DragType> = Extract<DragPayload, { type: T }>

const collisionDetector = DndCollision.shapeIntersection

/**
 * A modifier that restricts the drag overlay to within the window.
 */
class RestrictMovement extends DndTypes.Modifier {
  private lastInput: Coordinates | null = null
  private lastOutput: Coordinates | null = null

  apply(operation: DndTypes.DragOperation): Coordinates {
    if (!operation.shape) {
      this.lastInput = null
      this.lastOutput = null
      return operation.transform
    }

    const { initial, current } = operation.shape

    const width = current.boundingRectangle.width
    const height = current.boundingRectangle.height

    const { left, top } = initial.boundingRectangle

    if (operation.activatorEvent instanceof MouseEvent) {
      const offsetX = operation.activatorEvent.offsetX
      const offsetY = operation.activatorEvent.offsetY

      const minX = -left + offsetX
      const maxX = window.innerWidth - left - width + offsetX
      const minY = -top + offsetY
      const maxY = window.innerHeight - top - height + offsetY

      return {
        x: clamp(operation.transform.x, minX, maxX),
        y: clamp(operation.transform.y, minY, maxY),
      }
    }

    if (operation.activatorEvent instanceof KeyboardEvent) {
      const minX = -left
      const maxX = window.innerWidth - left - width
      const minY = -top
      const maxY = window.innerHeight - top - height

      // Build on the previous clamped output so excess movement doesn't accumulate.
      const deltaX = operation.transform.x - (this.lastInput?.x ?? 0)
      const deltaY = operation.transform.y - (this.lastInput?.y ?? 0)

      const outputX = this.lastOutput
        ? this.lastOutput.x + deltaX
        : operation.transform.x
      const outputY = this.lastOutput
        ? this.lastOutput.y + deltaY
        : operation.transform.y

      const clampedX = clamp(outputX, minX, maxX)
      const clampedY = clamp(outputY, minY, maxY)

      this.lastInput = { x: operation.transform.x, y: operation.transform.y }
      this.lastOutput = { x: clampedX, y: clampedY }

      return { x: clampedX, y: clampedY }
    }

    return operation.transform
  }
}

const useDraggable = <T extends DragType>(
  args: Dnd.UseDraggableInput<MatchingPayload<T>>,
) => Dnd.useDraggable<MatchingPayload<T>>(args)

const useDroppable = <T extends DragType>(
  args: Dnd.UseDroppableInput<MatchingPayload<T>>,
) =>
  Dnd.useDroppable<MatchingPayload<T>>({
    collisionDetector,
    ...args,
  })

type Draggable<T extends DragType = DragType> = DndSettings.Draggable<
  MatchingPayload<T>
> & { data: MatchingPayload<T>; type: T }

type Droppable<T extends DragType = DragType> = DndSettings.Droppable<
  MatchingPayload<T>
>

/**
 * Hook that registers a callback to be triggered globally before every drag operation starts.
 *
 * @param callback - The callback to register. It can modify the drag operation.
 */
const useBeforeDrag = (
  callback: (args: {
    element: HTMLElement
    source: Draggable
    manager: Dnd.DragDropManager
  }) => void,
) => {
  Dnd.useDragDropMonitor({
    onBeforeDragStart: (event, manager) => {
      const element = event.operation.source?.element
      const source = event.operation.source as Draggable | null

      if (element instanceof HTMLElement && source) {
        callback({
          element,
          source,
          manager,
        })
      }
    },
  })
}

/**
 * Hook that registers a callback to be triggered when a valid drop operation occurs.
 *
 * @param areaId - The ID of the drop area.
 * @param types - The types of draggable items that the drop area can accept.
 * @param callback - The callback that handles the drop operations of the given types.
 */
const useOnDrop = <T extends DragType>(
  areaId: string,
  types: T[],
  callback: (args: { source: Draggable<T>; target: Droppable<T> }) => void,
) => {
  Dnd.useDragDropMonitor({
    onDragEnd: (event) => {
      if (event.canceled) {
        return
      }

      const source = event.operation.source as Draggable | null
      const target = event.operation.target as Droppable | null

      if (
        source &&
        target &&
        types.includes(source.data.type as T) &&
        areaId === target.id
      ) {
        callback({
          source: source as Draggable<T>,
          target: target as Droppable<T>,
        })
      }
    },
  })
}

/**
 * Hook that tracks the current drag operation if any.
 */
function useCurrentDrag(): Draggable | undefined
function useCurrentDrag<T extends DragType>(
  types: T[],
): Draggable<T> | undefined
function useCurrentDrag<T extends DragType>(types?: T[]) {
  const operation = Dnd.useDragOperation<DragPayload>()

  const source = operation.source as Draggable | null

  if (source && types && (types as string[]).includes(source.data.type)) {
    return source as Draggable<T>
  }

  if (source && !types) {
    return source
  }

  return undefined
}

/**
 * Utility function to temporarily override the drag payload of a draggable source for the duration of a drag operation.
 * The original payload is restored after the operation ends.
 *
 * @param getPayload - A function that returns the new payload to use during the drag operation.
 * @param source - The draggable source whose payload should be overridden.
 * @param manager - The drag and drop manager that handles the drag operation.
 */
const overridePayload = <T extends DragType>(
  getPayload: () => MatchingPayload<T>,
  source: Draggable,
  manager: DndSettings.DragDropManager,
) => {
  const originalData = source.data
  const originalType = source.type

  source.data = getPayload()
  source.type = source.data.type

  const unsubscribe = manager.monitor.addEventListener('dragend', () => {
    source.data = originalData
    source.type = originalType
    unsubscribe()
  })
}

/**
 * Whether the given drag payload has no items being dragged.
 */
const isEmptyDragPayload = (payload: DragPayload): boolean =>
  Array.isArray(payload.dragged) && payload.dragged.length === 0

export {
  useDraggable,
  useDroppable,
  useBeforeDrag,
  useOnDrop,
  useCurrentDrag,
  overridePayload,
  isEmptyDragPayload,
  SnapToCursor,
  RestrictMovement,
  type DragPayload,
  type DragType,
  type MatchingPayload,
  type Draggable,
  type Droppable,
}
