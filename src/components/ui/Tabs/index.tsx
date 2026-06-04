import type { ReactNode } from 'react'
import * as Ariakit from '@ariakit/react'
import { match } from 'ts-pattern'

import { propsWithCn } from '@/utils/styles'
import type { Direction } from '@/utils/types'

import { Tab } from './Item'

interface TabsProps extends Ariakit.TabListProps {
  /**
   * The {@link Tab} items to be displayed in the list.
   */
  list: ReactNode

  /**
   * The direction in which the tabs should be displayed.
   */
  direction?: Direction
}

/**
 * List of grouped tabs that can be used to switch views.
 *
 * Should contain {@link Tab} components.
 */
const Tabs = (props: TabsProps) => {
  const {
    children,
    list,
    direction = 'horizontal',
    store,
    ...tabsProps
  } = props

  const tabs = Ariakit.useTabStore({ store })

  return (
    <Ariakit.TabProvider store={tabs} orientation={direction}>
      <Ariakit.TabList
        {...propsWithCn(
          tabsProps,
          match(direction)
            .with('horizontal', () => 'flex flex-row px-2 overflow-x-auto')
            .with('vertical', () => 'flex flex-col overflow-y-auto')
            .exhaustive(),
        )}
        focusable={false}
      >
        {list}
      </Ariakit.TabList>

      {children}
    </Ariakit.TabProvider>
  )
}

const useTabsHandler = (
  defaultTab?: string,
  storeProps?: Partial<Ariakit.TabStoreProps>,
) => {
  const store = Ariakit.useTabStore({
    defaultSelectedId: defaultTab,
    ...storeProps,
  })
  const selectedTab = Ariakit.useStoreState(store, 'selectedId')

  return { store, selectedTab }
}

export { Tabs, useTabsHandler, type TabsProps }
