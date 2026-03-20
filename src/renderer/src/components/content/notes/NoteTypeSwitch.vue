<template>
  <div class="type-switch">
    <div class="slider" :class="activeType?.cls" :style="sliderStyle"></div>
    <button
      v-for="(t, i) in types"
      :key="t.value"
      :ref="(el) => { if (el) btnRefs[i] = el as HTMLElement }"
      class="type-btn"
      :class="[t.cls, { active: modelValue === t.value }]"
      :title="t.label"
      @click="$emit('update:modelValue', t.value)"
    >
      {{ t.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { NoteType } from '@renderer/enums'

const props = defineProps<{
  modelValue: NoteType
}>()

defineEmits<{
  (e: 'update:modelValue', value: NoteType): void
}>()

const types = [
  { value: NoteType.WORK, label: '工作', cls: 'work' },
  { value: NoteType.LIVE, label: '日常', cls: 'live' },
  { value: NoteType.TODO, label: 'TODO', cls: 'todo' }
]

const btnRefs = ref<HTMLElement[]>([])

const activeIndex = computed(() => types.findIndex((t) => t.value === props.modelValue))
const activeType = computed(() => types[activeIndex.value])

const sliderStyle = ref<Record<string, string>>({})

function updateSlider() {
  const btn = btnRefs.value[activeIndex.value]
  if (!btn) return
  sliderStyle.value = {
    width: `${btn.offsetWidth}px`,
    transform: `translateX(${btn.offsetLeft - 2}px)`
  }
}

onMounted(() => updateSlider())
watch(() => props.modelValue, () => nextTick(updateSlider))
</script>

<style scoped lang="scss">
$text-main: #1f2937;
$text-secondary: #6b7280;

.type-switch {
  display: flex;
  position: relative;
  background: #f3f4f6;
  border-radius: 6px;
  padding: 2px;
  gap: 2px;

  .slider {
    position: absolute;
    top: 2px;
    left: 2px;
    height: calc(100% - 4px);
    border-radius: 4px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

    &.work {
      background: #dbeafe;
    }

    &.live {
      background: #dcfce7;
    }

    &.todo {
      background: #ffedd5;
    }
  }

  .type-btn {
    position: relative;
    z-index: 1;
    border: none;
    background: transparent;
    border-radius: 4px;
    min-width: 24px;
    padding: 4px 12px;
    font-size: 13px;
    color: $text-secondary;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
    font-weight: 500;

    &:hover {
      color: $text-main;
    }

    &.work.active {
      color: #1d4ed8;
    }

    &.live.active {
      color: #15803d;
    }

    &.todo.active {
      color: #c2410c;
    }
  }
}
</style>
