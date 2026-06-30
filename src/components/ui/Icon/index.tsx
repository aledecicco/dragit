import { type ComponentProps, useEffect, useRef, useState } from 'react'
import type { TablerIcon } from '@tabler/icons-react'
import { animate } from 'animejs'
import { mergeRefs } from 'react-merge-refs'
import { usePreviousDistinct } from 'react-use'
import { match } from 'ts-pattern'

import { FADE_IN_ANIMATION, FADE_OUT_ANIMATION } from '@/utils/animation'
import { propsWithCn } from '@/utils/styles'
import type { Size } from '@/utils/types'

type Glyph = TablerIcon

interface IconProps extends ComponentProps<Glyph> {
  /**
   * Constructor of the icon that should be displayed.
   */
  Glyph: Glyph

  /**
   * The size of the icon.
   */
  size?: Size

  /**
   * Additional props for the icon container.
   */
  containerProps?: ComponentProps<'div'>
}

/**
 * Wrapper for icons that has a default set of styles for consistent sizing.
 */
const Icon = (props: IconProps) => {
  const { Glyph, size = 'md', containerProps, ...iconProps } = props

  const leavingRef = useRef<Glyph>(null)
  const currentRef = useRef<Glyph>(null)

  const PrevGlyph = usePreviousDistinct(Glyph)
  const [LeavingGlyph, setLeavingGlyph] = useState<Glyph>()

  useEffect(() => {
    setLeavingGlyph(PrevGlyph)
  }, [PrevGlyph])

  useEffect(() => {
    if (!LeavingGlyph) {
      return
    }

    if (leavingRef.current) {
      animate(leavingRef.current, {
        ...FADE_OUT_ANIMATION,
        onComplete: () => {
          setLeavingGlyph(undefined)
        },
      })
    }

    if (currentRef.current) {
      animate(currentRef.current, FADE_IN_ANIMATION)
    }
  }, [LeavingGlyph])

  const commonProps = propsWithCn(
    iconProps,
    'shrink-0 col-start-1 row-start-1',
    match(size)
      .with('xs', () => 'stroke-1.5 size-3')
      .with('sm', () => 'stroke-1.5 size-3.5')
      .with('md', () => 'stroke-1.5 size-4')
      .with('lg', () => 'stroke-2 size-5')
      .exhaustive(),
  )

  return (
    <span {...propsWithCn(containerProps, 'inline-grid relative shrink-0')}>
      <Glyph {...commonProps} ref={mergeRefs([currentRef, commonProps.ref])} />

      {LeavingGlyph && (
        <LeavingGlyph
          {...commonProps}
          ref={mergeRefs([leavingRef, commonProps.ref])}
        />
      )}
    </span>
  )
}

export { Icon, type IconProps, type Glyph }
