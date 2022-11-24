// https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API#example

let _hidden: string | undefined = undefined
let _visibilityChange: string | undefined = undefined

if (typeof document.hidden !== 'undefined') {
  // Opera 12.10 and Firefox 18 and later support
  _hidden = 'hidden'
  _visibilityChange = 'visibilitychange'
} else if (typeof (document as any).msHidden !== 'undefined') {
  _hidden = 'msHidden'
  _visibilityChange = 'msvisibilitychange'
} else if (typeof (document as any).webkitHidden !== 'undefined') {
  _hidden = 'webkitHidden'
  _visibilityChange = 'webkitvisibilitychange'
}

if (_hidden === undefined || _visibilityChange === undefined) {
  throw new Error('Missing document.hidden and visibilitychange')
}

const hidden = _hidden!
const visibilityChange = _visibilityChange!

const documentHidden = () => {
  return document[hidden as keyof typeof document] as typeof document['hidden']
}

export { documentHidden, visibilityChange }
