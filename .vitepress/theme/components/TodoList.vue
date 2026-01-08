<template>
  <div class="todo-list-container">
    <div class="todo-header">
      <h3>{{ title }}</h3>
      <div class="todo-stats">
        <span class="completed-count">{{ completedCount }} / {{ todos.length }}</span>
        <span class="progress-bar-container">
          <span class="progress-bar" :style="{ width: progressPercentage + '%' }"></span>
        </span>
      </div>
    </div>

    <div class="todo-controls">
      <button @click="showAddForm = !showAddForm" class="btn-add">
        {{ showAddForm ? '取消' : '+ 添加任务' }}
      </button>
      <div class="filter-buttons">
        <button
          v-for="filter in filters"
          :key="filter.value"
          @click="currentFilter = filter.value"
          :class="['btn-filter', { active: currentFilter === filter.value }]"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <div v-if="showAddForm" class="add-form">
      <input
        v-model="newTodoText"
        @keyup.enter="addTodo"
        placeholder="输入新任务..."
        class="todo-input"
        ref="todoInput"
      />
      <select v-model="newTodoPriority" class="priority-select">
        <option value="low">低</option>
        <option value="medium">中</option>
        <option value="high">高</option>
      </select>
      <button @click="addTodo" class="btn-submit">添加</button>
    </div>

    <div class="todo-items">
      <TransitionGroup name="todo">
        <div
          v-for="todo in filteredTodos"
          :key="todo.id"
          :class="['todo-item', `priority-${todo.priority}`, { completed: todo.completed }]"
        >
          <input
            type="checkbox"
            :checked="todo.completed"
            @change="toggleTodo(todo.id)"
            class="todo-checkbox"
          />
          <span class="todo-text" @click="toggleTodo(todo.id)">{{ todo.text }}</span>
          <span class="todo-priority-badge">{{ getPriorityLabel(todo.priority) }}</span>
          <button @click="deleteTodo(todo.id)" class="btn-delete">×</button>
        </div>
      </TransitionGroup>

      <div v-if="filteredTodos.length === 0" class="empty-state">
        {{ getEmptyStateMessage() }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'

interface Todo {
  id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: number
}

const props = defineProps<{
  title?: string
  storageKey?: string
}>()

const title = props.title || '今日任务'
const storageKey = props.storageKey || `todo-list-${new Date().toISOString().split('T')[0]}`

const todos = ref<Todo[]>([])
const newTodoText = ref('')
const newTodoPriority = ref<'low' | 'medium' | 'high'>('medium')
const showAddForm = ref(false)
const currentFilter = ref<'all' | 'active' | 'completed'>('all')
const todoInput = ref<HTMLInputElement | null>(null)

const filters = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '进行中' },
  { value: 'completed', label: '已完成' }
] as const

const completedCount = computed(() => todos.value.filter(t => t.completed).length)
const progressPercentage = computed(() =>
  todos.value.length === 0 ? 0 : Math.round((completedCount.value / todos.value.length) * 100)
)

const filteredTodos = computed(() => {
  const filtered = todos.value.filter(todo => {
    if (currentFilter.value === 'active') return !todo.completed
    if (currentFilter.value === 'completed') return todo.completed
    return true
  })

  // Sort by priority (high > medium > low) and completion status
  return filtered.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
})

const getPriorityLabel = (priority: string) => {
  const labels = { low: '低', medium: '中', high: '高' }
  return labels[priority as keyof typeof labels]
}

const getEmptyStateMessage = () => {
  if (currentFilter.value === 'active') return '没有进行中的任务 🎉'
  if (currentFilter.value === 'completed') return '还没有完成任何任务'
  return '暂无任务，点击上方按钮添加'
}

const addTodo = () => {
  if (!newTodoText.value.trim()) return

  const newTodo: Todo = {
    id: Date.now().toString(),
    text: newTodoText.value.trim(),
    completed: false,
    priority: newTodoPriority.value,
    createdAt: Date.now()
  }

  todos.value.unshift(newTodo)
  newTodoText.value = ''
  newTodoPriority.value = 'medium'
  saveTodos()
}

const toggleTodo = (id: string) => {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
    saveTodos()
  }
}

const deleteTodo = (id: string) => {
  todos.value = todos.value.filter(t => t.id !== id)
  saveTodos()
}

const saveTodos = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(storageKey, JSON.stringify(todos.value))
  }
}

const loadTodos = () => {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        todos.value = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to load todos:', e)
        todos.value = []
      }
    }
  }
}

watch(showAddForm, async (newVal) => {
  if (newVal) {
    await nextTick()
    todoInput.value?.focus()
  }
})

onMounted(() => {
  loadTodos()
})
</script>

<style scoped>
.todo-list-container {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.todo-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--vp-c-text-1);
}

.todo-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.completed-count {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.progress-bar-container {
  width: 100px;
  height: 6px;
  background: var(--vp-c-divider);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  transition: width 0.3s ease;
}

.todo-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-add, .btn-filter, .btn-submit {
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-add:hover, .btn-filter:hover, .btn-submit:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand-1);
}

.btn-filter.active {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

.add-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.todo-input {
  flex: 1;
  min-width: 200px;
  padding: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
}

.todo-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.priority-select {
  padding: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 0.9rem;
}

.todo-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  transition: all 0.2s;
}

.todo-item:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand-1);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.priority-high {
  border-left: 3px solid #f56c6c;
}

.todo-item.priority-medium {
  border-left: 3px solid #e6a23c;
}

.todo-item.priority-low {
  border-left: 3px solid #67c23a;
}

.todo-checkbox {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.todo-text {
  flex: 1;
  cursor: pointer;
  color: var(--vp-c-text-1);
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: var(--vp-c-text-3);
}

.todo-priority-badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

.btn-delete {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  transition: color 0.2s;
}

.btn-delete:hover {
  color: #f56c6c;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}

/* Transitions */
.todo-enter-active,
.todo-leave-active {
  transition: all 0.3s ease;
}

.todo-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.todo-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.todo-move {
  transition: transform 0.3s ease;
}
</style>
