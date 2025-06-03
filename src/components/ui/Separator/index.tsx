import * as Ariakit from '@ariakit/react'

import { propsWithCn } from '@utils/styles'

interface SeparatorProps extends Ariakit.SeparatorProps {}

/**
 * A visual horizontal separator.
 */
const Separator = (props: SeparatorProps) => {
  const { ...separatorProps } = props
  return (
    <Ariakit.Separator
      {...propsWithCn(separatorProps, 'border-t-[1px] border-dark-600')}
    />
  )
}

export { Separator, type SeparatorProps }
