import { computed, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type VueWrapper, mount } from '@vue/test-utils'
import QuickWebsiteInput from '../../renderer/src/pages/QuickWebsiteInput.vue'

const submit = vi.fn()
const close = vi.fn()
const loadTree = vi.fn()
const toggleFolderExpanded = vi.fn()

const mockState = {
  folderTree: ref([
    {
      id: 0,
      title: 'Root',
      path: 'Root',
      level: 0,
      categoryId: -1,
      hasChildren: true,
      children: [
        {
          id: 1,
          title: 'Dev',
          path: 'Root > Dev',
          level: 1,
          categoryId: 9,
          hasChildren: true,
          children: []
        }
      ]
    }
  ]),
  selectedParentId: ref(0),
  form: ref({
    title: '',
    url: '',
    shortcut: '',
    description: '',
    icon: '',
    paramUrl: ''
  }),
  isLoading: ref(false),
  isSaving: ref(false),
  expandedFolderIds: ref(new Set([0, 1]))
}

vi.mock('../../renderer/src/hooks/useQuickWebsiteInput', () => ({
  useQuickWebsiteInput: () => ({
    ...mockState,
    selectedFolder: computed(() => ({ id: 0, title: 'Root', path: 'Root', categoryId: -1 })),
    loadTree,
    submit,
    close,
    toggleFolderExpanded
  })
}))

vi.mock('../../renderer/src/composables/clipboardUtils', () => ({
  readClipboardText: vi.fn(() => ''),
  isValidUrlForClipboard: vi.fn(() => false)
}))

vi.mock('../../renderer/src/composables/faviconUtils', () => ({
  FaviconFetchStatus: {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error'
  },
  createDebouncedFaviconFetcher: vi.fn(() => vi.fn())
}))

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('QuickWebsiteInput.vue', () => {
  let wrapper: VueWrapper | undefined

  beforeEach(() => {
    vi.clearAllMocks()
    loadTree.mockResolvedValue(undefined)
    mockState.selectedParentId.value = 0
    mockState.expandedFolderIds.value = new Set([0, 1])
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
  })

  it('shows Ctrl+Enter on the save button', async () => {
    wrapper = mount(QuickWebsiteInput)
    await flushPromises()

    const saveButton = wrapper.find('.btn.primary')
    expect(saveButton.attributes('title')).toContain('Ctrl+Enter')
    expect(saveButton.find('kbd').text()).toBe('Ctrl+Enter')
  })

  it('submits with Ctrl+Enter', async () => {
    wrapper = mount(QuickWebsiteInput)
    await flushPromises()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true }))
    await wrapper.vm.$nextTick()

    expect(submit).toHaveBeenCalledTimes(1)
  })

  it('toggles parent folders without selecting them from the toggle button', async () => {
    wrapper = mount(QuickWebsiteInput)
    await flushPromises()

    await wrapper.find('[data-test="folder-toggle-0"]').trigger('click')

    expect(toggleFolderExpanded).toHaveBeenCalledWith(0)
    expect(mockState.selectedParentId.value).toBe(0)
  })
})
