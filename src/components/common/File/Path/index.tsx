import { type ComponentProps, Fragment } from 'react'
import * as Path from '@tauri-apps/api/path'

import { splitPath } from '@/utils/string'
import { propsWithCn } from '@/utils/styles'

interface FilePathProps extends ComponentProps<'span'> {
  /**
   * The path to display.
   */
  filepath: string

  /**
   * Extra props for all separator elements between path segments.
   */
  separatorProps?: ComponentProps<'span'>
}

/**
 * Separates a path into segments and displays it in a more readable way.
 */
const FilePath = (props: FilePathProps) => {
  const { filepath, separatorProps, ...spanProps } = props

  const segments = splitPath(filepath)

  return (
    <span {...spanProps}>
      {segments.map((segment, i, all) => (
        <Fragment key={`${i + 1}`}>
          {segment}

          {i < all.length - 1 && (
            <span {...propsWithCn(separatorProps, 'mx-px')}>{Path.sep()}</span>
          )}
        </Fragment>
      ))}
    </span>
  )
}

export { FilePath, type FilePathProps }
