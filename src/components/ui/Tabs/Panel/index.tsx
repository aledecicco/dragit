import * as Ariakit from '@ariakit/react'

interface TabPanelProps extends Ariakit.TabPanelProps {}

/**
 * The content that is displayed when its associated tab is selected.
 */
const TabPanel = (props: TabPanelProps) => {
  const { ...panelProps } = props

  return <Ariakit.TabPanel {...panelProps} />
}

export { TabPanel, type TabPanelProps }
