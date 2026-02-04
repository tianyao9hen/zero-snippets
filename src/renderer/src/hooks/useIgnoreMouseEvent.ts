/**
 * @description 空白区域忽略鼠标事件
 */
export default () => {
  const setIgnoreMouseEvent = (el: HTMLElement) => {
    el.addEventListener('mouseover', (_e: MouseEvent) => {
      window.api.setIgnoreMouseEvent(false)
    })

    document.body.addEventListener('mouseover', (e: MouseEvent) => {
      if (e.target === document.body) {
        window.api.setIgnoreMouseEvent(true, { forward: true })
      }
    })
  }

  return {
    setIgnoreMouseEvent
  }
}
