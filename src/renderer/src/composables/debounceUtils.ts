/**
 * 防抖函数工具
 * @param {*} fn 防抖执行的函数
 * @param {*} delay 延迟时间
 * @param {*} option 配置参数
 *  leading： 是否开始的回调直接执行一次
 *  result： 函数类型，回调函数，通过它来将结果回调出去
 */
export function debounce<T, A extends any[], R>(
  fn: (this: T, ...args: A) => R,
  delay: number,
  option?: {
    leading?: boolean
    result?: (res: any) => void
  }
) {
  let timer: ReturnType<typeof setTimeout> | null = null
  const { leading = false, result = null } = option || {};
  // 可执行防抖函数
  const handleFn = function (this:T, ...args: A) {
    if (timer) clearTimeout(timer)
    let _this = this
    if (leading) {
      // 通过一个变量来记录是否立即执行
      let isInvoke = false
      if (!timer) {
        callFn(_this, args)
        isInvoke = true
      }
      // 定时器通过修改timer来修改instant
      timer = setTimeout(function () {
        timer = null
        if (!isInvoke) {
          callFn(_this, args)
        }
      }, delay)
    } else {
      timer = setTimeout(function () {
        console.log('timer', timer, delay)
        callFn(_this, args)
      }, delay)
    }
  }

  // 回调函数
  function callFn(context: T, args: A) {
    const res = fn.apply(context, args)
    result?.(res)
  }

  // 取消处理
  handleFn.cancel = function () {
    if (timer) clearTimeout(timer)
  }

  return handleFn
}
