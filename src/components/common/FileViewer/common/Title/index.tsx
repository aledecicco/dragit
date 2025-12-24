import * as Ariakit from '@ariakit/react'

import { useCurrentPath } from '@/api/utils'
import { FilePath } from '@/common/FilePath'
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
  annotation?: string
}

const FileViewerTitle = (props: FileViewerTitleProps) => {
  const { filepath, annotation, ...buttonProps } = props

  const repoPath = useCurrentPath()

  return (
    <Ariakit.Button
      {...propsWithCn(
        buttonProps,
        'font-medium',
        'hover:underline focus:underline',
        'px-0 py-0.5',
      )}
      onClick={(e) => {
        buttonProps.onClick?.(e)
        openFile(`${repoPath}/${filepath}`)
      }}
    >
      <Marquee>
        <FilePath
          filepath={`./${filepath}`}
          className={cn('text-light-700')}
          separatorProps={{ className: cn('text-light-300') }}
        />

        <span className={cn('text-light-900 text-sm italic ml-2')}>
          {annotation}
        </span>
      </Marquee>
    </Ariakit.Button>
  )
}

export { FileViewerTitle, type FileViewerTitleProps }
