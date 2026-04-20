import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RegisterForm } from '../../components/ui/Register/Register.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import './Register.css'

const initialValues = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
}

export function RegisterPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [auth.isAuthenticated, navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  const validate = () => {
    const nextErrors = {}

    if (!values.name.trim()) {
      nextErrors.name = 'El nombre es obligatorio.'
    }

    if (!values.email.trim()) {
      nextErrors.email = 'El correo es obligatorio.'
    }

    if (!values.password.trim()) {
      nextErrors.password = 'La contrasena es obligatoria.'
    }

    if (values.password !== values.password_confirmation) {
      nextErrors.password_confirmation = 'Las contrasenas no coinciden.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async () => {
    setApiError('')

    if (!validate()) {
      return
    }

    setLoading(true)

    try {
      await auth.register(values)
      navigate('/login', {
        replace: true,
        state: {
          notice: 'Registro exitoso. Ahora puedes iniciar sesion.',
        },
      })
    } catch (error) {
      setApiError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card__header">
          <span className="eyebrow">Crear cuenta</span>
          <h1>Registro</h1>
          <p>Crea tu usuario para luego iniciar sesion</p>
        </div>

        <RegisterForm
          values={values}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleSubmit}
          loading={loading}
          apiError={apiError}
        />

        <p className="auth-card__footer">
          Ya tienes cuenta?{' '}
          <Link className="text-link" to="/login">
            Inicia sesion
          </Link>
        </p>
      </section>
    </main>
  )
}
