import './Modal.css'

export function Modal({ open, title, eyebrow = 'Categorias', children, onClose }) {
  if (!open) {
    return null
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <div>
            <span className="panel__eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
          </div>
          <button type="button" className="modal__close" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
