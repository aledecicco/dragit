import type { ReactNode } from 'react'
import * as Ariakit from '@ariakit/react'

import { useCurrentPath } from '@/api/utils'
import { FilePath } from '@/common/File/Path'
import { Marquee } from '@/ui/Marquee'
import { openFile } from '@/utils/interaction'
import { cn, propsWithCn } from '@/utils/styles'

interface FileViewerTitleProps extends Ariakit.ButtonProps {
  /**
   * The path of the file being displayed.
   */
  filepath: string

  /**
   * An optional annotation to display alongside the file path.
   */
  annotation?: ReactNode
}

/**
 * The title section of the file viewer, displaying the file path.
 */
const FileViewerTitle = (props: FileViewerTitleProps) => {
  const { filepath, annotation, ...buttonProps } = props

  const repoPath = useCurrentPath()

  return (
    <div className={cn('flex flex-col items-start w-full')}>
      <Ariakit.Button
        {...propsWithCn(
          buttonProps,
          'font-medium',
          'hover:underline focus:underline',
          'px-0 pt-0.5 pb-0',
          'text-light-300',
        )}
        onClick={(e) => {
          buttonProps.onClick?.(e)
          openFile(`${repoPath}/${filepath}`)
        }}
      >
        <Marquee>
          <FilePath
            filepath={`./${filepath}`}
            separatorProps={{ className: cn('text-light-50') }}
          />
        </Marquee>
      </Ariakit.Button>

      {typeof annotation === 'string' ? (
        <Marquee className={cn('text-light-900 text-xs italic')}>
          {annotation}
        </Marquee>
      ) : (
        annotation
      )}
    </div>
  )
}

export { FileViewerTitle, type FileViewerTitleProps }
