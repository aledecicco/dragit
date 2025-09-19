import type { ReactNode } from 'react'
import { all, createStarryNight } from '@wooorm/starry-night'
import type { Root, RootContent } from 'hast'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import { match } from 'ts-pattern'

import type { FileDiff } from '@/api/models'

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
    .filter((line) => line.type !== 'added')
    .map((line) => line.content.map((segment) => segment.slice(1)).join(''))
    .join('')
}

const getContentAfter = (fileDiff: FileDiff): string => {
  return fileDiff
    .filter((line) => line.type !== 'removed')
    .map((line) => line.content.map((segment) => segment.slice(1)).join(''))
    .join('')
}

const splitIntoLines = (tree: Root): RootContent[][] => {
  const lines: RootContent[][] = []
  let line: RootContent[] = []

  tree.children.forEach((node) => {
    if (node.type === 'text' && node.value === '\n') {
      lines.push(line)
      line = []
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
  let pointerBefore = 0

  const treeAfter = getTree(getContentAfter(fileDiff), path)
  const linesAfter = treeAfter ? splitIntoLines(treeAfter) : []
  let pointerAfter = 0

  const res: RootContent[] = []

  for (const diffLine of fileDiff) {
    const lineBefore = linesBefore.at(pointerBefore) ?? []
    const lineAfter = linesAfter.at(pointerAfter) ?? []

    match(diffLine.type)
      .with('added', () => {
        res.push(...lineAfter, { type: 'text', value: '\n' })
        pointerAfter++
      })
      .with('removed', () => {
        res.push(...lineBefore, { type: 'text', value: '\n' })
        pointerBefore++
      })
      .with('unchanged', () => {
        res.push(...lineBefore, { type: 'text', value: '\n' })
        pointerBefore++
        pointerAfter++
      })
  }

  return renderTree({ type: 'root', children: res })
}
