import { useEffect, useState } from 'react'
import { documentHidden, visibilityChange } from './polyfillVisibilityChange'

function useVisibilityChange() {
  const [visibility, setVisibility] = useState(!documentHidden())

  useEffect(() => {
    const onVisibilityChange = () => {
      setVisibility(!documentHidden())
    }
    document.addEventListener(visibilityChange, onVisibilityChange)
    return () => {
      document.removeEventListener(visibilityChange, onVisibilityChange)
    }
  }, [])

  return visibility
}

export { useVisibilityChange }
