import type { ReactNode } from 'react'
import { all, createStarryNight } from '@wooorm/starry-night'
import type { Element, Root, Text } from 'hast'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import { match } from 'ts-pattern'

import type { DiffType, MergeDiffStage } from '@/api/models'

export type LineType = DiffType | MergeDiffStage

export type LineNode = Element | Text

const starryNight = await createStarryNight(all)
export const NEWLINE_REGEX = /\r\n|\r|\n/

/**
 * Builds a syntax-highlighted tree for the given content and language identifier.
 *
 * @param content - The full content to highlight.
 * @param identifier - The language identifier (can be a filepath).
 */
export const getTree = (content: string, identifier: string): Root => {
  const scope = starryNight.flagToScope(identifier)
  if (!scope) {
    return {
      type: 'root',
      children: [{ type: 'text', value: content }],
    }
  }

  return starryNight.highlight(content, scope)
}

/**
 * Renders a syntax-highlighted tree into a React node.
 *
 * @param tree - The hast tree to render.
 */
export const renderTree = (tree: Root): ReactNode => {
  const node = toJsxRuntime(tree, { Fragment, jsx, jsxs })
  return node
}

/**
 * Splits a syntax-highlighted tree into lines.
 *
 * @param tree - The hast tree to split.
 */
export const splitIntoLines = (tree: Root): LineNode[][] => {
  const lines: LineNode[][] = []
  let line: LineNode[] = []

  tree.children.forEach((node) => {
    if (node.type === 'text') {
      const parts = node.value.split(NEWLINE_REGEX)
      parts.forEach((part, index) => {
        if (index > 0) {
          line.push({ type: 'text', value: '\n' })
          lines.push(line)
          line = []
        }

        if (part.length > 0) {
          line.push({ ...node, value: part })
        }
      })
    } else if (node.type === 'element') {
      line.push(node)
    }
  })

  if (line.length > 0) {
    lines.push(line)
  }

  return lines
}

/**
 * Builds a shallow copy of the relevant children of a node.
 *
 * @param node - The node to get the children of.
 */
export const getNodeChildren = (node: Element): LineNode[] => {
  const res: LineNode[] = []

  for (const child of node.children) {
    if (child.type === 'text' || child.type === 'element') {
      res.push(child)
    }
  }

  return res
}

/**
 * Wraps the given node with the appropriate highlighting for the given segment type.
 *
 * @param node - The node to wrap.
 * @param type - The type to apply.
 */
export const wrapNodeInType = (node: Text, type: LineType): LineNode => {
  return match(type)
    .returnType<LineNode>()
    .with('added', () => ({
      type: 'element',
      tagName: 'span',
      properties: {
        className: 'bg-success-400/15 py-0.5',
      },
      children: [node],
    }))
    .with('removed', () => ({
      type: 'element',
      tagName: 'span',
      properties: {
        className: 'bg-danger-400/15 py-0.5',
      },
      children: [node],
    }))
    .with('ours', () => ({
      type: 'element',
      tagName: 'span',
      properties: {
        className: 'bg-primary-400/15 py-0.5',
      },
      children: [node],
    }))
    .with('theirs', () => ({
      type: 'element',
      tagName: 'span',
      properties: {
        className: 'bg-warning-400/15 py-0.5',
      },
      children: [node],
    }))
    .with('unchanged', () => node)
    .exhaustive()
}

/**
 * Wraps the given line with the appropriate highlighting for the given line type.
 *
 * @param line - The line to wrap.
 * @param type - The type to apply.
 */
export const wrapLineInType = (line: LineNode[], type: LineType): Element => {
  return match(type)
    .returnType<Element>()
    .with('added', () => ({
      type: 'element',
      children: line,
      tagName: 'span',
      properties: {
        className: 'bg-success-500/8 w-full block -ml-2 pl-2 pr-5',
      },
    }))
    .with('removed', () => ({
      type: 'element',
      children: line,
      tagName: 'span',
      properties: { className: 'bg-danger-500/8 w-full block -ml-2 pl-2 pr-5' },
    }))
    .with('ours', () => ({
      type: 'element',
      children: line,
      tagName: 'span',
      properties: {
        className: 'bg-primary-500/8 w-full block -ml-2 pl-2 pr-5',
      },
    }))
    .with('theirs', () => ({
      type: 'element',
      children: line,
      tagName: 'span',
      properties: {
        className: 'bg-warning-500/8 w-full block -ml-2 pl-2 pr-5',
      },
    }))
    .with('unchanged', () => ({
      type: 'element',
      children: line,
      tagName: 'span',
      properties: { className: 'w-full block -ml-2 pl-2 pr-5' },
    }))
    .exhaustive()
}
