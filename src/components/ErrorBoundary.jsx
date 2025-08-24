import React, { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-center text-red-500">Đã xảy ra lỗi: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;