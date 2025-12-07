import type { ComponentProps } from 'react'

import { propsWithCn } from '@/utils/styles'

interface BranchMessageProps extends ComponentProps<'p'> {
  /** Whether this message is for the base branch. */
  isBase: boolean
}

/**
 * Messages that display the status of the main branch and the base branch,
 * in cases where no commits are displayed.
 */
const BranchMessage = (props: BranchMessageProps) => {
  const { isBase, ...pProps } = props

  return (
    <p
      {...propsWithCn(
        pProps,
        'text-center text-light-950 italic',
        'absolute top-9 w-max p-1 overflow-visible',
        isBase ? 'left-[68%]' : 'left-[12%]',
      )}
    />
  )
}

export { BranchMessage, type BranchMessageProps }
