import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LoginForm } from '../../components/ui/Login/Login.jsx' // Asegúrate de que este archivo exista (lo crearemos abajo)
import { useAuth } from '../../hooks/useAuth.js'
import './Login.css'

const initialValues = {
  email: '',
  password: '',
}

export function LoginPage() {
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
    // Limpiar error del campo específico cuando el usuario escribe
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const nextErrors = {}

    if (!values.email.trim()) {
      nextErrors.email = 'El correo es obligatorio.'
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      nextErrors.email = 'El formato del correo no es válido.'
    }

    if (!values.password.trim()) {
      nextErrors.password = 'La contraseña es obligatoria.'
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
      await auth.login(values)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setApiError(error.message || 'Credenciales incorrectas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        {/* Sección Logo (Añadida para completar el diseño) */}
        <div className="auth-card__logo-wrapper">
          <img src="/Logo.png" alt="App Logo" className="auth-card__logo" />
        </div>

        <div className="auth-card__header">
          <span className="eyebrow">Acceso Seguro</span>
          <h1>Bienvenido de nuevo</h1>
          <p>Ingresa tus credenciales para gestionar tu sistema.</p>
        </div>

        <LoginForm
          values={values}
          errors={errors}
          apiError={apiError}
          loading={loading}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />

        <p className="auth-card__footer">
          ¿No tienes cuenta?{' '}
          <Link className="text-link" to="/register">
            Regístrate aquí
          </Link>
        </p>
      </section>
    </main>
  )
}