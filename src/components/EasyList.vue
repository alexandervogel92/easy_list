<template>
  <main class="todo-app">
    <h1 class="todo-title">ToDo</h1>

    <section class="todo-card">
      <div class="todo-inputs">
        <input
          v-model="draft"
          class="todo-input"
          type="text"
          placeholder="Kartoffeln"
          @keydown.enter.prevent="addItem"
        >
        <button
          class="todo-btn todo-btn--add"
          type="button"
          @click="addItem"
        >
          Hinzufügen
        </button>
        <button
          class="todo-btn todo-btn--delete"
          type="button"
          @click="removeCompleted"
        >
          Löschen
        </button>
      </div>

      <ul v-if="items.length" class="todo-list" role="list">
        <li
          v-for="item in items"
          :key="item.id"
          class="todo-item"
          @click="toggleCompleted(item.id)"
        >
          <span
            :class="['todo-text', { 'todo-text--done': item.completed }]"
          >
            {{ item.task }}
          </span>
          <input
            v-model="item.completed"
            class="todo-check"
            type="checkbox"
            aria-label="Als erledigt markieren"
            @click.stop
            @change="reorderItems"
          >
        </li>
      </ul>
    </section>
  </main>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue'

  interface StoredItem {
    task: string
    completed: boolean
  }

  interface TodoItem extends StoredItem {
    id: string
  }

  const STORAGE_KEY = 'easy-list-entry'
  const items = ref<TodoItem[]>([])
  const draft = ref('')

  function createId () {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }
    return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`
  }

  function sanitizeTask (value: string) {
    return value
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  function addItem () {
    const value = sanitizeTask(draft.value)
    if (!value) return
    items.value.push({
      id: createId(),
      task: value,
      completed: false,
    })
    draft.value = ''
    reorderItems()
  }

  function toggleCompleted (id: string) {
    const item = items.value.find(entry => entry.id === id)
    if (!item) return
    item.completed = !item.completed
    reorderItems()
  }

  function removeCompleted () {
    items.value = items.value.filter(item => !item.completed)
  }

  function reorderItems () {
    const pending = items.value.filter(item => !item.completed)
    const done = items.value.filter(item => item.completed)
    items.value = [...pending, ...done]
  }

  function loadStoredItems () {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as StoredItem[]
      if (!Array.isArray(parsed)) return
      items.value = parsed
        .map(item => ({
          task: typeof (item as { task?: unknown }).task === 'string'
            ? sanitizeTask((item as { task: string }).task)
            : (typeof (item as { text?: unknown }).text === 'string'
              ? sanitizeTask((item as { text: string }).text)
              : ''),
          completed: Boolean((item as { completed?: unknown }).completed),
        }))
        .filter(item => item.task.length > 0)
        .map(item => ({
          id: createId(),
          task: item.task.trim(),
          completed: item.completed,
        }))
      reorderItems()
    } catch {
      items.value = []
    }
  }

  function persistItems () {
    if (typeof window === 'undefined') return
    const payload: StoredItem[] = items.value.map(item => ({
      task: item.task,
      completed: item.completed,
    }))
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  onMounted(() => {
    loadStoredItems()
  })

  watch(items, () => {
    persistItems()
  }, { deep: true })
</script>
