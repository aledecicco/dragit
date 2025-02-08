import clsx from 'clsx'
import { Separator as SeparatorPrimitive } from 'radix-ui'

interface SeparatorProps extends SeparatorPrimitive.SeparatorProps {}

const Separator = (props: SeparatorProps) => {
  const { ...separatorProps } = props
  return (
    <SeparatorPrimitive.Root
      {...separatorProps}
      className={clsx(
        'border-t-[1px] border-dark-600',
        separatorProps.className,
      )}
    />
  )
}

export { Separator, type SeparatorProps }
