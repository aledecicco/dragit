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
  | DragDef<'tag', TagInfo>
  | DragDef<'stash', StashInfo>

type DragType = DragPayload['type']

type MatchingPayload<T extends DragType> = Extract<DragPayload, { type: T }>

/**
 * A collision detector that uses the center of the drag overlay shape instead
 * of the raw pointer position.
 *
 * Using the shape center ensures collision detection aligns with where the
 * indicator visually appears on screen for both input methods.
 */
const shapeCenterCollision: DndTypes.CollisionDetector = ({
  dragOperation,
  droppable,
}) => {
  const point =
    dragOperation.shape?.current.center ?? dragOperation.position.current

  if (!point || !droppable.shape) {
    return null
  }

  if (droppable.shape.containsPoint(point)) {
    const center = droppable.shape.center
    const distance = Math.sqrt(
      (center.x - point.x) ** 2 + (center.y - point.y) ** 2,
    )

    return {
      id: droppable.id,
      value: distance === 0 ? Number.POSITIVE_INFINITY : 1 / distance,
      type: DndTypes.CollisionType.PointerIntersection,
      priority: DndTypes.CollisionPriority.Normal,
    }
  }

  return null
}

const useDraggable = <T extends DragType>(
  args: Dnd.UseDraggableInput<MatchingPayload<T>>,
) => Dnd.useDraggable<MatchingPayload<T>>(args)

const useDroppable = <T extends DragType>(
  args: Dnd.UseDroppableInput<MatchingPayload<T>>,
) =>
  Dnd.useDroppable<MatchingPayload<T>>({
    collisionDetector: shapeCenterCollision,
    ...args,
  })

type Draggable<T extends DragType = DragType> = DndSettings.Draggable<
  MatchingPayload<T>
> & { data: MatchingPayload<T> }

type Droppable<T extends DragType = DragType> = DndSettings.Droppable<
  MatchingPayload<T>
>

/**
 * Hook that registers a callback to be triggered globally before every drag operation starts.
 *
 * @param callback - The callback to register. It can modify the drag operation.
 */
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
const useCurrentDrag = () => {
  const { source, target } = Dnd.useDragOperation<DragPayload>()

  return {
    source: source as Draggable | undefined | null,
    target: target as Droppable | undefined | null,
  }
}

/**
 * Hook that tracks whether the current drag operation can be dropped on a drop area that accepts the given types.
 *
 * @param types - The types of draggable items that the drop area can accept.
 */
const useCanDrop = <T extends DragType>(types: T[]): boolean => {
  const { source } = useCurrentDrag()

  return !!source && types.includes(source.data.type as T)
}

export {
  useDraggable,
  useDroppable,
  useBeforeDrag,
  useOnDrop,
  useCurrentDrag,
  useCanDrop,
  SnapToCursor,
  type DragPayload,
  type DragType,
  type MatchingPayload,
  type Draggable,
  type Droppable,
}
