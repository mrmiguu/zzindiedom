import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './ErrorBoundary'
import './index.css'
import App from './ZzApp'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <ErrorBoundary>
      <div className="font-mono">
        <App />
      </div>
      <Toaster containerClassName="toaster font-mono -translate-y-16 opacity-95" position="bottom-center" />
    </ErrorBoundary>
  </>,
)
