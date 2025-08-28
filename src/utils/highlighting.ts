import type { ReactNode } from 'react'
import { all, createStarryNight } from '@wooorm/starry-night'
import type { Root, RootContent } from 'hast'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'

import type { FileDiff } from '@/api/models'
import {
  getDiffSegmentType,
  lineHasRemovals,
} from '@/common/FileDiffViewer/utils'

const starryNight = await createStarryNight(all)

const getTree = (content: string, identifier: string): Root | undefined => {
  const scope = starryNight.flagToScope(identifier)
  if (!scope) {
    return undefined
  }
  return starryNight.highlight(content, scope)
}

const renderTree = (tree: Root): ReactNode => {
  const node = toJsxRuntime(tree, { Fragment, jsx, jsxs })
  return node
}

const getContentBefore = (fileDiff: FileDiff): string => {
  return fileDiff
    .map((line) => {
      console.log(line)
      return line
        .filter((segment) => getDiffSegmentType(segment) !== 'added')
        .map((segment) => segment.slice(1))
        .join('')
    })
    .join('\n')
}

const getContentAfter = (fileDiff: FileDiff): string => {
  return fileDiff
    .map((line) =>
      line
        .filter((segment) => getDiffSegmentType(segment) !== 'removed')
        .map((segment) => segment.slice(1))
        .join(''),
    )
    .join('\n')
}

const splitIntoLines = (tree: Root): RootContent[][] => {
  const lines: RootContent[][] = []
  let line: RootContent[] = []

  tree.children.forEach((node) => {
    if (node.type === 'text') {
      const regex = /\r\n|\r|\n/
      node.value.split(regex).forEach((part, index) => {
        if (index > 0) {
          lines.push(line)
          line = []
        }

        if (part) {
          line.push({ type: 'text', value: part })
        }
      })
    } else {
      line.push(node)
    }
  })

  if (line.length > 0) {
    lines.push(line)
  }

  return lines
}

export const highlightDiff = (fileDiff: FileDiff, path: string): ReactNode => {
  const treeBefore = getTree(getContentBefore(fileDiff), path)
  const linesBefore = treeBefore ? splitIntoLines(treeBefore) : []

  const treeAfter = getTree(getContentAfter(fileDiff), path)
  const linesAfter = treeAfter ? splitIntoLines(treeAfter) : []

  let res: RootContent[] = []
  for (let i = 0; i < fileDiff.length; i++) {
    const diffLine = fileDiff[i]

    if (lineHasRemovals(diffLine)) {
      res = res.concat(linesBefore.at(i) ?? [])
      res.push({ type: 'text', value: '\n' })
    }

    res = res.concat(linesAfter.at(i) ?? [])
    res.push({ type: 'text', value: '\n' })
  }

  console.log('res', res)

  return renderTree({ type: 'root', children: res })
}
