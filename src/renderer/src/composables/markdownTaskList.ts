const TASK_ITEM_PATTERN = /^(\s*(?:[-+*]|\d+[.)])\s+\[)([ xX])(\]\s+.*)$/gm

/**
 * Toggle the checked state of a markdown task item by its rendered checkbox index.
 *
 * @param source Markdown source text.
 * @param taskIndex Zero-based task item index among markdown task items.
 * @param checked Whether the task should be checked.
 * @returns Markdown source with the requested task item toggled.
 */
export function toggleMarkdownTask(source: string, taskIndex: number, checked: boolean): string {
  if (taskIndex < 0) return source

  let currentIndex = -1
  let didToggle = false
  const nextSource = source.replace(TASK_ITEM_PATTERN, (full, prefix, _marker, suffix) => {
    currentIndex += 1
    if (currentIndex !== taskIndex) return full

    didToggle = true
    return `${prefix}${checked ? 'x' : ' '}${suffix}`
  })

  return didToggle ? nextSource : source
}
