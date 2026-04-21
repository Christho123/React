const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api'

const AUTH_STORAGE_KEY = 'react-jwt-session'

let refreshPromise = null

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function readStoredSession() {
  if (!canUseStorage()) {
    return null
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveStoredSession(session) {
  if (!canUseStorage()) {
    return
  }

  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredSession() {
  saveStoredSession(null)
}

function emitAuthEvent(type, detail) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(type, { detail }))
}

function extractSession(payload) {
  const data = payload?.data ?? payload ?? {}

  return {
    user:
      data?.user ??
      (data?.id
        ? {
            id: data.id,
            name: data.name ?? '',
            email: data.email ?? '',
          }
        : null),
    accessToken:
      data?.access_token ?? data?.accessToken ?? data?.token ?? null,
    refreshToken:
      data?.refresh_token ?? data?.refreshToken ?? null,
  }
}

function looksLikeJsonResponse(response) {
  const contentType = response.headers.get('content-type') ?? ''
  return contentType.includes('application/json')
}

function buildQuery(params = {}, mapping = {}) {
  const searchParams = new URLSearchParams()
  const pageKey = mapping.pageKey ?? 'page'
  const pageSizeKey = mapping.pageSizeKey ?? 'page_size'

  if (params.page != null && params.page !== '') {
    searchParams.set(pageKey, String(params.page))
  }

  if (params.pageSize != null && params.pageSize !== '') {
    searchParams.set(pageSizeKey, String(params.pageSize))
  }

  if (params.search) {
    searchParams.set('search', params.search)
  }

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

async function readResponseBody(response) {
  if (looksLikeJsonResponse(response)) {
    return response.json()
  }

  const text = await response.text()
  return text ? { message: text } : null
}

async function refreshSession(refreshToken) {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      const payload = await readResponseBody(response)

      if (!response.ok) {
        clearStoredSession()
        emitAuthEvent('auth:logout')
        const error = new Error(payload?.message ?? 'No se pudo renovar la sesión.')
        error.status = response.status
        error.details = payload
        throw error
      }

      const currentSession = readStoredSession() ?? {}
      const refreshed = extractSession(payload)
      const nextSession = {
        ...currentSession,
        ...refreshed,
        user: refreshed.user ?? currentSession.user ?? null,
      }

      saveStoredSession(nextSession)
      emitAuthEvent('auth:session-updated', nextSession)
      return payload
    })().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    auth = true,
    retry = true,
  } = options

  const session = readStoredSession()

  const requestHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...headers,
  }

  if (auth && session?.accessToken) {
    requestHeaders.Authorization = `Bearer ${session.accessToken}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const payload = await readResponseBody(response)

  if (!response.ok) {
    if (
      response.status === 401 &&
      auth &&
      retry &&
      session?.refreshToken
    ) {
      await refreshSession(session.refreshToken)
      return request(path, { ...options, retry: false })
    }

    const error = new Error(payload?.message ?? 'La solicitud no se pudo completar.')
    error.status = response.status
    error.details = payload

    if (response.status === 401) {
      error.code = 'AUTH_EXPIRED'
    }

    throw error
  }

  return payload
}

export async function authLogin(payload) {
  const response = await request('/auth/login', {
    method: 'POST',
    body: payload,
    auth: false,
  })

  const session = extractSession(response)
  const nextSession = {
    user: session.user,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  }

  saveStoredSession(nextSession)
  emitAuthEvent('auth:session-updated', nextSession)
  return response
}

export async function authRegister(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export async function authLogout() {
  const session = readStoredSession()

  try {
    return await request('/auth/logout', {
      method: 'POST',
      body: {
        refresh_token: session?.refreshToken,
      },
    })
  } finally {
    clearStoredSession()
    emitAuthEvent('auth:logout')
  }
}

export async function getCategories(params = {}) {
  return request(`/products/categories${buildQuery(params)}`)
}

export async function createCategory(payload) {
  return request('/products/categories', {
    method: 'POST',
    body: payload,
  })
}

export async function updateCategory(id, payload) {
  return request(`/products/categories/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteCategory(id) {
  return request(`/products/categories/${id}`, {
    method: 'DELETE',
  })
}

export async function getCategory(id) {
  return request(`/products/categories/${id}`)
}

export async function getBrands(params = {}) {
  return request(`/products/brands${buildQuery(params)}`)
}

export async function createBrand(payload) {
  return request('/products/brands', {
    method: 'POST',
    body: payload,
  })
}

export async function updateBrand(id, payload) {
  return request(`/products/brands/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export async function patchBrand(id, payload) {
  return request(`/products/brands/${id}`, {
    method: 'PATCH',
    body: payload,
  })
}

export async function deleteBrand(id) {
  return request(`/products/brands/${id}`, {
    method: 'DELETE',
  })
}

export async function getBrand(id) {
  return request(`/products/brands/${id}`)
}

export async function getSuppliers(params = {}) {
  return request(`/products/suppliers${buildQuery(params)}`)
}

export async function createSupplier(payload) {
  return request('/products/suppliers', {
    method: 'POST',
    body: payload,
  })
}

export async function updateSupplier(id, payload) {
  return request(`/products/suppliers/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export async function patchSupplier(id, payload) {
  return request(`/products/suppliers/${id}`, {
    method: 'PATCH',
    body: payload,
  })
}

export async function deleteSupplier(id) {
  return request(`/products/suppliers/${id}`, {
    method: 'DELETE',
  })
}

export async function getSupplier(id) {
  return request(`/products/suppliers/${id}`)
}
