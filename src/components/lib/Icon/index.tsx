import type { IconProps as TablerIconProps } from '@tabler/icons-react'
import clsx from 'clsx'
import type { ComponentType } from 'react'
import { match } from 'ts-pattern'

import type { Size } from '@utils/types'

type Glyph = ComponentType<TablerIconProps>

interface IconProps extends TablerIconProps {
  Glyph: ComponentType<TablerIconProps>
  size?: Size
}

const Icon = (props: IconProps) => {
  const { Glyph, size = 'md', ...iconProps } = props

  return (
    <Glyph
      {...iconProps}
      className={clsx(
        'shrink-0',
        match(size)
          .with('sm', () => 'stroke-1.5 size-4')
          .with('md', () => 'stroke-2 size-5')
          .with('lg', () => 'stroke-2.5 size-5.5')
          .exhaustive(),
        iconProps.className,
      )}
    />
  )
}

export { Icon, type IconProps, type Glyph }
