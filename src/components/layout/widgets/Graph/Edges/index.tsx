import { match } from 'ts-pattern'

import {
  ParentType,
  useTrackedElements,
} from '@/layout/widgets/Graph/SvgOverlay/store'
import { getPosition } from '@/layout/widgets/Graph/SvgOverlay/utils'

import { cn } from '@/utils/styles'

import { graphAnimator } from '../SvgOverlay/animation'
import { buildPath, getEdgeAnchors } from './utils'

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

    const [elemPos, parentPos] = getEdgeAnchors(
      getPosition(elem),
      getPosition(parentElem),
    )

    const path = buildPath(elemPos, parentPos).join(' ')

    return (
      <path
        key={id}
        ref={(pathEl) => graphAnimator.registerPath(id, pathEl)}
        className={cn(
          'fill-none stroke-4 animate-node-fade-in',
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
