import React from "react";
import AppFallbackScreen from "@/components/app/AppFallbackScreen";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AppErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <AppFallbackScreen
          title="This screen hit an unexpected error"
          message="LogScope ran into a rendering problem. Reload the app to recover and continue working."
          actionLabel="Reload now"
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
