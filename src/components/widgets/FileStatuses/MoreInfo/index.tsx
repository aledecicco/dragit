import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { P, match } from 'ts-pattern'

import type { FileInfo } from '@api/models'
interface FileStatusMoreInfoProps extends ComponentProps<'div'> {
  file: FileInfo
}

const FileStatusMoreInfo = (props: FileStatusMoreInfoProps) => {
  const { file, ...divProps } = props

  return (
    <div {...divProps}>
      <ul className={clsx('text-xs pl-5 list-disc')}>
        {'staged' in file && file.staged !== 'unmodified' ? (
          <li className={clsx('text-success-200 marker:text-success-200')}>
            Staged changes:{' '}
            {match(file)
              .with({ staged: 'added' }, () => 'File created')
              .with(
                { staged: 'copied' },
                (file) => `File copied from ${file.from}`,
              )
              .with({ staged: 'deleted' }, () => 'File deleted')
              .with({ staged: 'modified' }, () => 'File contents modified')
              .with(
                { staged: 'renamed' },
                (file) => `File renamed from ${file.from}`,
              )
              .with({ staged: 'typeChanged' }, () => 'File type changed')
              .exhaustive()}
          </li>
        ) : (
          <li className={clsx('text-light-400 marker:text-light-400')}>
            No staged changes
          </li>
        )}

        {'unstaged' in file && file.unstaged !== 'unmodified' ? (
          <li
            className={clsx(
              file.status === 'unmerged'
                ? 'text-warning-100 marker:text-warning-100'
                : 'text-danger-400 marker:text-danger-400',
            )}
          >
            Unstaged changes:{' '}
            {match(file)
              .with({ unstaged: 'added' }, () => 'File created')
              .with({ unstaged: 'deleted' }, () => 'File deleted')
              .with({ unstaged: 'modified' }, () => 'File contents modified')
              .with({ unstaged: 'typeChanged' }, () => 'File type changed')
              .with(
                {
                  unstaged: P.union(
                    'addedByThem',
                    'addedByUs',
                    'bothAdded',
                    'bothDeleted',
                    'bothModified',
                    'deletedByThem',
                    'deletedByUs',
                  ),
                },
                (file) => (
                  <>
                    Merge in progress (
                    {match(file.unstaged)
                      .with('addedByThem', () => 'Added by them')
                      .with('bothAdded', () => 'Added by both')
                      .with('addedByUs', () => 'Added by us')
                      .with('bothDeleted', () => 'Deleted by both')
                      .with('bothModified', () => 'Modified by both')
                      .with('deletedByThem', () => 'Deleted by them')
                      .with('deletedByUs', () => 'Deleted by us')
                      .exhaustive()}
                    )
                  </>
                ),
              )
              .exhaustive()}
          </li>
        ) : (
          <li className={clsx('text-light-400 marker:text-light-400')}>
            No unstaged changes
          </li>
        )}
      </ul>
    </div>
  )
}

export { FileStatusMoreInfo, type FileStatusMoreInfoProps }
