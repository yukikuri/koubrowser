import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { net } from 'electron'
import { fetchQuestSchemaFile } from '../kcquest_schema_fetcher'

vi.mock('electron', () => ({ net: { fetch: vi.fn() } }))

const url = 'https://example.com/v1/quest-schema.json'

describe('fetchQuestSchemaFile', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(net.fetch).mockReset()
  })

  afterEach(() => {
    expect(vi.getTimerCount()).toBe(0)
    vi.useRealTimers()
  })

  it('returns the downloaded text unchanged without validating it', async () => {
    const jsonText = 'not yet validated JSON'
    vi.mocked(net.fetch).mockResolvedValue(new Response(jsonText))

    expect(await fetchQuestSchemaFile(url, false)).toEqual({ success: true, jsonText })
    expect(net.fetch).toHaveBeenCalledWith(url, {
      signal: expect.any(AbortSignal),
      credentials: 'omit',
      cache: 'no-cache'
    })
  })

  it('returns an error for HTTP failure', async () => {
    vi.mocked(net.fetch).mockResolvedValue(new Response('Not found', { status: 404 }))
    const result = await fetchQuestSchemaFile(url, false)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.message).toContain('404')
  })

  it('returns network errors', async () => {
    const error = new Error('Network unavailable')
    vi.mocked(net.fetch).mockRejectedValue(error)
    expect(await fetchQuestSchemaFile(url, false)).toEqual({ success: false, error })
  })

  it('returns response body read errors', async () => {
    const error = new Error('Interrupted download')
    const response = new Response()
    vi.spyOn(response, 'text').mockRejectedValue(error)
    vi.mocked(net.fetch).mockResolvedValue(response)
    expect(await fetchQuestSchemaFile(url, false)).toEqual({ success: false, error })
  })

  it('aborts a request after 15 seconds', async () => {
    vi.mocked(net.fetch).mockImplementation((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new Error('Aborted')), { once: true })
    }))
    const resultPromise = fetchQuestSchemaFile(url, false)
    await vi.advanceTimersByTimeAsync(15_000)
    expect(await resultPromise).toEqual({ success: false, error: new Error('Aborted') })
  })
})
