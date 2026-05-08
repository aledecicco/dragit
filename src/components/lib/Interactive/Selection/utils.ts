import type * as Ariakit from '@ariakit/react'

export type ItemEventClassification =
  | { kind: 'multiSelection' }
  | { kind: 'singleItem'; itemIndex: number }
  | { kind: 'outside' }

type CompositeStore = Ariakit.CompositeStore<
  Ariakit.CompositeStoreState['items'][number]
>

export const classifyItemEvent = (
  target: EventTarget,
  composite: CompositeStore | undefined,
  selectedItems: Set<number>,
): ItemEventClassification => {
  if (!(target instanceof HTMLElement)) {
    return { kind: 'outside' }
  }

  const itemIndex =
    composite
      ?.getState()
      .renderedItems.findIndex((item) => item.element?.contains(target)) ?? -1

  if (itemIndex === -1) {
    return { kind: 'outside' }
  }

  if (selectedItems.size > 1 && selectedItems.has(itemIndex)) {
    return { kind: 'multiSelection' }
  }

  return { kind: 'singleItem', itemIndex }
}
