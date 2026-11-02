import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center text-red-600">
          <h2 className="font-display text-2xl">Something went wrong.</h2>
          <button onClick={() => this.setState({ hasError: false })} className="mt-4 rounded-full bg-ocean px-6 py-2 text-sm font-bold text-white">
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
