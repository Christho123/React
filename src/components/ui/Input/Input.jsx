import './Input.css'

export function Input({
  label,
  error,
  hint,
  textarea = false,
  className = '',
  id,
  ...props
}) {
  const fieldId = id ?? props.name
  const FieldTag = textarea ? 'textarea' : 'input'

  return (
    <label className={`field ${className}`.trim()} htmlFor={fieldId}>
      {label ? <span className="field__label">{label}</span> : null}
      <FieldTag id={fieldId} className="field__control" {...props} />
      {hint ? <span className="field__hint">{hint}</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  )
}
