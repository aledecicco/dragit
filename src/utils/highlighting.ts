import type { ReactNode } from 'react'
import { all, createStarryNight } from '@wooorm/starry-night'
import type { Root, RootContent } from 'hast'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'

import type { FileDiff } from '@/api/models'
import {
  getDiffSegmentType,
  lineHasAdditions,
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
    .map((line) =>
      line
        .filter((segment) => getDiffSegmentType(segment) !== 'added')
        .map((segment) => segment.slice(1))
        .join(''),
    )
    .join('')
}

const getContentAfter = (fileDiff: FileDiff): string => {
  return fileDiff
    .map((line) =>
      line
        .filter((segment) => getDiffSegmentType(segment) !== 'removed')
        .map((segment) => segment.slice(1))
        .join(''),
    )
    .join('')
}

const LINES_REGEX = /\r\n|\r|\n/

const splitIntoLines = (tree: Root): RootContent[][] => {
  const lines: RootContent[][] = []
  let line: RootContent[] = []

  tree.children.forEach((node) => {
    if (node.type === 'text') {
      node.value.split(LINES_REGEX).forEach((part, index) => {
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

const getLineContent = (line: RootContent[]): string => {
  return line
    .map((node) => {
      if (node.type === 'text') {
        return node.value
      }
      return getLineContent('children' in node ? node.children : [])
    })
    .join('')
}

export const highlightDiff = (fileDiff: FileDiff, path: string): ReactNode => {
  const treeBefore = getTree(getContentBefore(fileDiff), path)
  const linesBefore = treeBefore ? splitIntoLines(treeBefore) : []
  let pointerBefore = 0

  const treeAfter = getTree(getContentAfter(fileDiff), path)
  const linesAfter = treeAfter ? splitIntoLines(treeAfter) : []
  let pointerAfter = 0

  const res: RootContent[] = []

  //fileDiff[1][0] = '-  '
  //fileDiff[2][0] = '   '

  for (const diffLine of fileDiff) {
    const lineBefore = linesBefore.at(pointerBefore) ?? []
    const lineAfter = linesAfter.at(pointerAfter) ?? []

    const hasRemovals = lineHasRemovals(diffLine)
    const hasAdditions = lineHasAdditions(diffLine)

    console.log(diffLine, getLineContent(lineBefore), getLineContent(lineAfter))

    const lastSegment = diffLine.at(-1)
    const endsWithNewline = lastSegment?.endsWith('\n') ?? false

    if (lastSegment && endsWithNewline) {
      const lastSegmentType = getDiffSegmentType(lastSegment)

      if (!hasAdditions && !hasRemovals) {
        res.push(...lineBefore, { type: 'text', value: '\n' })
        pointerBefore++
        pointerAfter++
        continue
      }

      if (lastSegmentType !== 'added') {
        res.push(...lineBefore, { type: 'text', value: '\n' })
        pointerBefore++
      }

      if (lastSegmentType !== 'removed') {
        res.push(...lineAfter, { type: 'text', value: '\n' })
        pointerAfter++
      }
    }
  }

  return renderTree({ type: 'root', children: res })
}
