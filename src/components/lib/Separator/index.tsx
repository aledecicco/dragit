import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'

interface SeparatorProps extends Ariakit.SeparatorProps {}

const Separator = (props: SeparatorProps) => {
  const { ...separatorProps } = props
  return (
    <Ariakit.Separator
      {...separatorProps}
      className={clsx(
        'border-t-[1px] border-dark-600',
        separatorProps.className,
      )}
    />
  )
}

export { Separator, type SeparatorProps }
