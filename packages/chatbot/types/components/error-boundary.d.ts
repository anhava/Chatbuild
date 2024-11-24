import React, { ReactNode } from "react";
type ErrorBoundaryProps = {
    fallback: ReactNode;
    children: ReactNode;
};
type ErrorBoundaryState = {
    hasError: boolean;
};
declare class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState;
    static getDerivedStateFromError(): ErrorBoundaryState;
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void;
    render(): React.ReactNode;
}
export default ErrorBoundary;
//# sourceMappingURL=error-boundary.d.ts.map