import type { Virtualizer } from '@tanstack/react-virtual'

const getAnchorTranslationY = (
  virtualizer: Virtualizer<HTMLDivElement, Element>,
  distance: number,
): number => {
  return (
    (virtualizer.options.gap + virtualizer.options.estimateSize(distance)) *
    distance
  )
}

export { getAnchorTranslationY }
