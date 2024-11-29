import clsx from 'clsx'
import { type HTMLProps, forwardRef } from 'react'
import { match } from 'ts-pattern'

type FlexProps = (
  | {
      direction: 'column' | 'reverse-column'
      horizontal?: 'left' | 'center' | 'right'
      vertical?: 'top' | 'center' | 'bottom' | 'spaced'
    }
  | {
      direction?: 'row' | 'reverse-row'
      horizontal?: 'left' | 'center' | 'right' | 'spaced'
      vertical?: 'top' | 'center' | 'bottom'
    }
) &
  HTMLProps<HTMLDivElement>

const Flex = forwardRef<HTMLDivElement, FlexProps>((props, ref) => {
  const { direction, horizontal, vertical, ...divProps } = props

  return (
    <div
      {...divProps}
      ref={ref}
      className={clsx(
        'flex',

        match(props.direction)
          .with('column', () => 'flex-col')
          .with('row', () => 'flex-row')
          .with('reverse-column', () => 'flex-col-reverse')
          .with('reverse-row', () => 'flex-row-reverse')
          .with(undefined, () => undefined)
          .exhaustive(),

        (props.direction === 'column' ||
          props.direction === 'reverse-column') &&
          match(props.horizontal)
            .with('left', () => 'items-start')
            .with('center', () => 'items-center')
            .with('right', () => 'items-end')
            .with(undefined, () => undefined)
            .exhaustive(),

        props.direction === 'column' &&
          match(props.vertical)
            .with('top', () => 'justify-start')
            .with('center', () => 'justify-center')
            .with('bottom', () => 'justify-end')
            .with('spaced', () => 'justify-between')
            .with(undefined, () => undefined)
            .exhaustive(),

        props.direction === 'reverse-column' &&
          match(props.vertical)
            .with('top', () => 'justify-end')
            .with('center', () => 'justify-center')
            .with('bottom', () => 'justify-start')
            .with('spaced', () => 'justify-between')
            .with(undefined, () => undefined)
            .exhaustive(),

        (props.direction === 'row' || props.direction === 'reverse-row') &&
          match(props.vertical)
            .with('top', () => 'items-start')
            .with('center', () => 'items-center')
            .with('bottom', () => 'items-end')
            .with(undefined, () => undefined)
            .exhaustive(),

        props.direction === 'row' &&
          match(props.horizontal)
            .with('left', () => 'justify-start')
            .with('center', () => 'justify-center')
            .with('right', () => 'justify-end')
            .with('spaced', () => 'justify-between')
            .with(undefined, () => undefined)
            .exhaustive(),

        props.direction === 'reverse-row' &&
          match(props.horizontal)
            .with('left', () => 'justify-end')
            .with('center', () => 'justify-center')
            .with('right', () => 'justify-start')
            .with('spaced', () => 'justify-between')
            .with(undefined, () => undefined)
            .exhaustive(),

        divProps.className,
      )}
    />
  )
})

export { Flex, type FlexProps }
