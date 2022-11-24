import { Component, ErrorInfo, PropsWithChildren } from 'react'

type ErrorBoundaryState = {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="absolute flex items-center justify-center w-full h-full overflow-hidden bg-red-500">
          <pre className="w-3/4 p-3 whitespace-pre-wrap animate-pulse outline">{this.state.error.message}</pre>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
