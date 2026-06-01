import React from 'react'

interface Props {
  children?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(_error: Error, _info: any) {
    // Could send to analytics here
    // console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2 style={{ color: 'var(--danger)' }}>Something went wrong</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: 'var(--text-2)' }}>
            {this.state.error?.message}
          </pre>
        </div>
      )
    }

    return this.props.children as React.ReactElement
  }
}
