import { jest } from '@jest/globals'
import Worker from '../src/index.ts'

let mockFetch: jest.Mock

const mockCtx = { waitUntil: jest.fn(), passThroughOnException: jest.fn() } as any

const makeEnv = (overrides?: Record<string, string | undefined>): any => ({
  ALLOWED_ORIGINS: '',
  CUSTOM_HEADER: '',
  ...overrides,
})

const makeOkResponse = (): Response => new Response('ok', { status: 200 })
const makeErrorResponse = (): Response => new Response('error', { status: 500 })

beforeEach(() => {
  mockFetch = jest.fn()
  jest.spyOn(globalThis, 'fetch').mockImplementation(mockFetch)
})

afterEach(() => {
  jest.restoreAllMocks()
})

it('Returns original image when via header contains image-resizing', async () => {
  mockFetch.mockResolvedValueOnce(makeOkResponse())
  const request = new Request('https://example.com/content/images/photo.jpg', {
    headers: { via: 'image-resizing' },
  })
  const response = await Worker.fetch(request, makeEnv(), mockCtx)
  expect(response.status).toBe(200)
  expect(mockFetch).toHaveBeenCalledTimes(1)
  expect(mockFetch).toHaveBeenCalledWith(request)
})

it('Passes SVG images through without resizing', async () => {
  mockFetch.mockResolvedValueOnce(makeOkResponse())
  const request = new Request('https://example.com/content/images/icon.svg')
  const response = await Worker.fetch(request, makeEnv(), mockCtx)
  expect(response.status).toBe(200)
  expect(mockFetch).toHaveBeenCalledTimes(1)
})

it('Passes request through when origin is not allowed', async () => {
  mockFetch.mockResolvedValueOnce(makeOkResponse())
  const request = new Request('https://evil.com/content/images/photo.jpg')
  const env = makeEnv({ ALLOWED_ORIGINS: 'example.com' })
  const response = await Worker.fetch(request, env, mockCtx)
  expect(response.status).toBe(200)
  expect(mockFetch).toHaveBeenCalledTimes(1)
})

it('Returns resized image when fetch succeeds', async () => {
  const resized = new Response('resized', { status: 200 })
  mockFetch.mockResolvedValueOnce(resized)
  const request = new Request('https://example.com/content/images/size/w300/photo.jpg')
  const env = makeEnv({ ALLOWED_ORIGINS: 'example.com' })
  const response = await Worker.fetch(request, env, mockCtx)
  expect(response).toBe(resized)
  expect(mockFetch).toHaveBeenCalledTimes(1)
})

it('Falls back to original when resized response is not ok', async () => {
  const resizeFailed = new Response('fail', { status: 500 })
  const original = new Response('original', { status: 200 })
  mockFetch.mockResolvedValueOnce(resizeFailed)
  mockFetch.mockResolvedValueOnce(original)
  const request = new Request('https://example.com/content/images/size/w300/photo.jpg')
  const env = makeEnv({ ALLOWED_ORIGINS: 'example.com' })
  const response = await Worker.fetch(request, env, mockCtx)
  expect(response).toBe(original)
  expect(mockFetch).toHaveBeenCalledTimes(2)
})

it('Falls back to origin when resizer fetch throws', async () => {
  mockFetch.mockRejectedValueOnce(new Error('resize failed'))
  const original = new Response('original', { status: 200 })
  mockFetch.mockResolvedValueOnce(original)
  const request = new Request('https://example.com/content/images/size/w300/photo.jpg')
  const env = makeEnv({ ALLOWED_ORIGINS: 'example.com' })
  const response = await Worker.fetch(request, env, mockCtx)
  expect(response).toBe(original)
  expect(mockFetch).toHaveBeenCalledTimes(2)
})

it('Returns 500 when both resizer and origin fetch fail', async () => {
  mockFetch.mockRejectedValueOnce(new Error('resize failed'))
  mockFetch.mockRejectedValueOnce(new Error('origin also failed'))
  const request = new Request('https://example.com/content/images/size/w300/photo.jpg')
  const env = makeEnv({ ALLOWED_ORIGINS: 'example.com' })
  const response = await Worker.fetch(request, env, mockCtx)
  expect(response.status).toBe(500)
  const text = await response.text()
  expect(text).toBe('Error fetching image')
  expect(mockFetch).toHaveBeenCalledTimes(2)
})

it('Appends custom header to resizer fetch request', async () => {
  mockFetch.mockResolvedValueOnce(new Response('ok', { status: 200 }))
  const request = new Request('https://example.com/content/images/size/w300/photo.jpg')
  const env = makeEnv({ ALLOWED_ORIGINS: 'example.com', CUSTOM_HEADER: 'x-token,abc123' })
  await Worker.fetch(request, env, mockCtx)
  expect(mockFetch).toHaveBeenCalledTimes(1)
  const fetchArg = mockFetch.mock.calls[0][0] as Request
  expect(fetchArg.headers.get('x-token')).toBe('abc123')
})

it('Allows all origins when ALLOWED_ORIGINS is empty', async () => {
  mockFetch.mockResolvedValueOnce(new Response('ok', { status: 200 }))
  const request = new Request('https://any-domain.com/content/images/size/w300/photo.jpg')
  const env = makeEnv({ ALLOWED_ORIGINS: '' })
  const response = await Worker.fetch(request, env, mockCtx)
  expect(response.status).toBe(200)
  expect(mockFetch).toHaveBeenCalledTimes(1)
})

it('Allows all origins when ALLOWED_ORIGINS is undefined', async () => {
  mockFetch.mockResolvedValueOnce(new Response('ok', { status: 200 }))
  const request = new Request('https://any-domain.com/content/images/size/w300/photo.jpg')
  const env = makeEnv({ ALLOWED_ORIGINS: undefined })
  const response = await Worker.fetch(request, env, mockCtx)
  expect(response.status).toBe(200)
  expect(mockFetch).toHaveBeenCalledTimes(1)
})

it('Passes GIF images through without resizing', async () => {
  mockFetch.mockResolvedValueOnce(new Response('ok', { status: 200 }))
  const request = new Request('https://example.com/content/images/animation.gif')
  const env = makeEnv({ ALLOWED_ORIGINS: 'example.com' })
  const response = await Worker.fetch(request, env, mockCtx)
  expect(response.status).toBe(200)
  expect(mockFetch).toHaveBeenCalledTimes(1)
})
