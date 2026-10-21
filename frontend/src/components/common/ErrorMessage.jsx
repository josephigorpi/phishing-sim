// === frontend/src/components/common/ErrorMessage.jsx ===
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-message" role="alert">
      <p className="error-message__text">
        ⚠ {message || 'Ha ocurrido un error inesperado.'}
      </p>
      {onRetry && (
        <button type="button" className="btn-secondary" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
