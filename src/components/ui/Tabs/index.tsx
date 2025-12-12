import * as Ariakit from '@ariakit/react'

import { propsWithCn } from '@/utils/styles'

interface TabsProps extends Ariakit.TabListProps {}

/**
 * List of grouped tabs that can be used to switch views.
 */
const Tabs = (props: TabsProps) => {
  const { store, ...listProps } = props
  return (
    <Ariakit.TabProvider selectOnMove={false} store={store}>
      <Ariakit.TabList {...propsWithCn(listProps, 'flex flex-row px-2')} />
    </Ariakit.TabProvider>
  )
}

const useTabsHandler = (defaultTab?: string) => {
  const store = Ariakit.useTabStore({
    defaultSelectedId: defaultTab,
  })
  const selectedTab = Ariakit.useStoreState(store, 'selectedId')

  return { store, selectedTab }
}

export { Tabs, useTabsHandler, type TabsProps }
