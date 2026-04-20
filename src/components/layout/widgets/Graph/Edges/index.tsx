import { match } from 'ts-pattern'

import {
  ParentType,
  useTrackedElements,
} from '@/layout/widgets/Graph/SvgOverlay/store'
import { getPosition } from '@/layout/widgets/Graph/SvgOverlay/utils'

import { cn } from '@/utils/styles'

import { NODE_SIZE } from '../Commit/Node'
import { buildPath, EDGE_OFFSET } from './utils'

/**
 * Implementation of the SVG overlay renderer that draws edges between a commit and its parent.
 *
 * Edges can have different styles, represented by {@link ParentType}.
 */
const Edges = () => {
  const elements = useTrackedElements()

  const edges = [...elements.entries()].map(([id, elem]) => {
    if (!elem.ref.current || !elem.parent) {
      return undefined
    }

    const parentElem = elements.get(elem.parent.id)

    if (!parentElem?.ref.current) {
      return undefined
    }

    const elemPos = getPosition(elem)
    const parentPos = getPosition(parentElem)

    // Anchor is center bottom
    elemPos.x += NODE_SIZE / 2
    elemPos.y += NODE_SIZE + EDGE_OFFSET

    // Anchor is center top
    parentPos.x += NODE_SIZE / 2
    parentPos.y -= EDGE_OFFSET

    const path = buildPath(elemPos, parentPos).join(' ')

    return (
      <path
        key={id}
        className={cn(
          'fill-none stroke-4',
          match(elem.parent.type)
            .with('solid', () => 'stroke-primary-600')
            .with('dashed', () => 'stroke-primary-600 [stroke-dasharray:8_5]')
            .with('unconfirmed', () => 'stroke-accent-400')
            .with('draft', () => 'stroke-light-950/40 [stroke-dasharray:8_5]')
            .otherwise(() => undefined),
        )}
        d={path}
      />
    )
  })

  return <>{edges}</>
}

export { Edges }
