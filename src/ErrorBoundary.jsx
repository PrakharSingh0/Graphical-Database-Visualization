import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
    this.setState({ error, info })
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:24,fontFamily:'Inter,Arial',color:'#fee',background:'#2b0f0f',minHeight:'100vh'}}>
          <h2>Something went wrong</h2>
          <pre style={{whiteSpace:'pre-wrap',color:'#ffd3d3'}}>{this.state.error?.toString()}</pre>
          <details style={{color:'#ffd3d3'}}>
            {this.state.info?.componentStack}
          </details>
        </div>
      )
    }
    return this.props.children
  }
}
