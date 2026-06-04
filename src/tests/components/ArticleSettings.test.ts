import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import ArticleSettings from '../../../src/renderer/src/components/content/setting/ArticleSettings.vue'

const mockApi = {
  getAllSettings: vi.fn(),
  setSetting: vi.fn()
}

global.window.api = mockApi as any

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('ArticleSettings.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.getAllSettings.mockResolvedValue([
      {
        key: 'oss.accessKeySecret',
        value: 'secret-value'
      }
    ])
  })

  function mountArticleSettings() {
    return mount(ArticleSettings, {
      global: {
        plugins: [createPinia()]
      }
    })
  }

  it('toggles AccessKey Secret visibility without changing the value', async () => {
    const wrapper = mountArticleSettings()
    await flushPromises()

    const input = wrapper.find<HTMLInputElement>('input[placeholder="Secret..."]')
    const toggle = wrapper.find('[data-test="toggle-access-key-secret"]')

    expect(input.attributes('type')).toBe('password')
    expect(input.element.value).toBe('secret-value')

    await toggle.trigger('click')
    expect(input.attributes('type')).toBe('text')
    expect(input.element.value).toBe('secret-value')

    await toggle.trigger('click')
    expect(input.attributes('type')).toBe('password')
    expect(input.element.value).toBe('secret-value')
  })
})
