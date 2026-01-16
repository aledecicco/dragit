import * as Ariakit from '@ariakit/react'

interface TabPanelProps extends Ariakit.TabPanelProps {}

const TabPanel = (props: TabPanelProps) => {
  const { ...panelProps } = props

  return <Ariakit.TabPanel {...panelProps} />
}

export { TabPanel, type TabPanelProps }
