// === frontend/src/components/common/LoadingSpinner.jsx ===
export default function LoadingSpinner({ text = 'Cargando información…' }) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <div className="loading-spinner__ring" />
      <span className="loading-spinner__text">{text}</span>
    </div>
  );
}
