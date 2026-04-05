export function LoadingState() {
  return (
    <div className="state-loading">
      <div className="state-loading__spinner" />
      <p>Loading...</p>
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="state-error">
      <div className="state-error__icon">✗</div>
      <p>{message || 'Something went wrong.'}</p>
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="state-empty">
      <div className="state-empty__icon">○</div>
      <p>{message || 'Nothing here yet.'}</p>
    </div>
  );
}
