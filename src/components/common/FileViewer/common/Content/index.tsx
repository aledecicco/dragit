import type { ComponentProps } from 'react'

import { cn, propsWithCn } from '@/utils/styles'

interface FileViewerContentProps extends ComponentProps<'div'> {}

/**
 * Displays the contents of a file.
 */
const FileViewerContent = (props: FileViewerContentProps) => {
  const { children, ...divProps } = props
  return (
    <div
      {...propsWithCn(
        divProps,
        'overflow-x-auto overflow-y-hidden',
        'col-start-1 -col-end-1',
      )}
    >
      <div
        className={cn(
          'w-max min-w-full pl-2',
          'whitespace-pre font-mono leading-7',
        )}
      >
        {children}
      </div>
    </div>
  )
}

export { FileViewerContent, type FileViewerContentProps }
