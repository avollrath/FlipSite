const API_BASE = '/api'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | unknown[]
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  const isFormData = options.body instanceof FormData
  let body = options.body as BodyInit | undefined

  if (options.body !== undefined && !isFormData && !(options.body instanceof Blob)) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(options.body)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    body,
    headers,
  })

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string }
    return payload.error || response.statusText
  } catch {
    return response.statusText
  }
}
