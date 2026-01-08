<template>
  <div class="todo-list-container">
    <!-- Supabase 配置提示 -->
    <div v-if="!isConfigured" class="config-notice">
      <h4>⚙️ Supabase 未配置</h4>
      <p>要启用跨设备同步，请配置 Supabase。</p>
      <button @click="showConfig = !showConfig" class="btn-config">
        {{ showConfig ? '取消配置' : '配置 Supabase' }}
      </button>

      <div v-if="showConfig" class="config-form">
        <input
          v-model="supabaseUrl"
          placeholder="Supabase URL"
          class="config-input"
        />
        <input
          v-model="supabaseKey"
          placeholder="Supabase Anon Key"
          type="password"
          class="config-input"
        />
        <button @click="handleSaveConfig" class="btn-save-config">保存配置</button>
        <a
          href="#supabase-setup"
          class="setup-link"
          target="_blank"
        >查看设置指南</a>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-banner">
      ⚠️ {{ error }}
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading && todos.length === 0" class="loading-state">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- 主界面 -->
    <div v-else>
      <div class="todo-header">
        <h3>
          {{ title }}
          <span v-if="isConfigured" class="sync-badge" title="已启用云端同步">☁️</span>
        </h3>
        <div class="todo-stats">
          <span class="completed-count">{{ completedCount }} / {{ todos.length }}</span>
          <span class="progress-bar-container">
            <span class="progress-bar" :style="{ width: progressPercentage + '%' }"></span>
          </span>
        </div>
      </div>

      <div class="todo-controls">
        <button @click="showAddForm = !showAddForm" class="btn-add" :disabled="isLoading">
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
          @keyup.enter="handleAddTodo"
          placeholder="输入新任务..."
          class="todo-input"
          ref="todoInput"
          :disabled="isLoading"
        />
        <select v-model="newTodoPriority" class="priority-select" :disabled="isLoading">
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
        </select>
        <button @click="handleAddTodo" class="btn-submit" :disabled="isLoading">
          {{ isLoading ? '添加中...' : '添加' }}
        </button>
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
              @change="handleToggleTodo(todo.id, todo.completed)"
              class="todo-checkbox"
              :disabled="isLoading"
            />
            <span class="todo-text" @click="handleToggleTodo(todo.id, todo.completed)">
              {{ todo.text }}
            </span>
            <span class="todo-priority-badge">{{ getPriorityLabel(todo.priority) }}</span>
            <button
              @click="handleDeleteTodo(todo.id)"
              class="btn-delete"
              :disabled="isLoading"
            >
              ×
            </button>
          </div>
        </TransitionGroup>

        <div v-if="filteredTodos.length === 0" class="empty-state">
          {{ getEmptyStateMessage() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useSupabase, type TodoRecord } from '../composables/useSupabase'

interface Todo {
  id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  created_at?: string
  date?: string
}

const props = defineProps<{
  title?: string
  date?: string
}>()

const title = props.title || '今日任务'
const currentDate = props.date || new Date().toISOString().split('T')[0]

// Supabase
const {
  isConfigured,
  isLoading,
  error,
  saveConfig,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  subscribeTodos
} = useSupabase()

// 配置相关
const showConfig = ref(false)
const supabaseUrl = ref('')
const supabaseKey = ref('')

// Todo 状态
const todos = ref<Todo[]>([])
const newTodoText = ref('')
const newTodoPriority = ref<'low' | 'medium' | 'high'>('medium')
const showAddForm = ref(false)
const currentFilter = ref<'all' | 'active' | 'completed'>('all')
const todoInput = ref<HTMLInputElement | null>(null)

// 实时订阅
let subscription: any = null

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

// Supabase 配置
const handleSaveConfig = () => {
  if (!supabaseUrl.value || !supabaseKey.value) {
    alert('请填写完整的 Supabase 配置')
    return
  }

  saveConfig(supabaseUrl.value, supabaseKey.value)
  showConfig.value = false

  // 重新加载数据
  loadTodos()
  setupRealtimeSubscription()
}

// TODO: Implement error handling strategy
// When Supabase operations fail, how should the app respond?
// Options to consider:
// 1. Show error message to user (current implementation)
// 2. Fallback to LocalStorage for offline support
// 3. Implement retry mechanism with exponential backoff
// 4. Queue failed operations and retry when connection restored
const handleError = (operation: string, err: any) => {
  // Your implementation here
  console.error(`${operation} failed:`, err)
  error.value = `${operation}失败，请稍后重试`
}

// 加载 todos
const loadTodos = async () => {
  if (!isConfigured.value) {
    console.log('[TodoList] Supabase not configured, skipping load')
    return
  }

  const data = await getTodos(currentDate)
  if (data && data.length > 0) {
    todos.value = data.map(item => ({
      id: item.id,
      text: item.text,
      completed: item.completed,
      priority: item.priority,
      created_at: item.created_at,
      date: item.date
    }))
  }
}

// 添加 todo
const handleAddTodo = async () => {
  if (!newTodoText.value.trim()) return

  const todoData = {
    id: Date.now().toString(),
    text: newTodoText.value.trim(),
    completed: false,
    priority: newTodoPriority.value,
    date: currentDate
  }

  if (isConfigured.value) {
    const created = await createTodo(todoData)
    if (created) {
      // 实时订阅会自动更新列表，这里可以选择乐观更新
      todos.value.unshift({
        ...todoData,
        created_at: created.created_at
      })
    } else {
      handleError('添加任务', error.value)
    }
  } else {
    // 未配置时使用本地
    todos.value.unshift(todoData)
  }

  newTodoText.value = ''
  newTodoPriority.value = 'medium'
}

// 切换完成状态
const handleToggleTodo = async (id: string, currentCompleted: boolean) => {
  if (isConfigured.value) {
    const success = await updateTodo(id, { completed: !currentCompleted })
    if (success) {
      const todo = todos.value.find(t => t.id === id)
      if (todo) todo.completed = !currentCompleted
    } else {
      handleError('更新任务', error.value)
    }
  } else {
    const todo = todos.value.find(t => t.id === id)
    if (todo) todo.completed = !todo.completed
  }
}

// 删除 todo
const handleDeleteTodo = async (id: string) => {
  if (isConfigured.value) {
    const success = await deleteTodo(id)
    if (success) {
      todos.value = todos.value.filter(t => t.id !== id)
    } else {
      handleError('删除任务', error.value)
    }
  } else {
    todos.value = todos.value.filter(t => t.id !== id)
  }
}

// 设置实时订阅
const setupRealtimeSubscription = () => {
  if (!isConfigured.value) return

  subscription = subscribeTodos(currentDate, (updatedTodos) => {
    todos.value = updatedTodos.map(item => ({
      id: item.id,
      text: item.text,
      completed: item.completed,
      priority: item.priority,
      created_at: item.created_at,
      date: item.date
    }))
  })
}

watch(showAddForm, async (newVal) => {
  if (newVal) {
    await nextTick()
    todoInput.value?.focus()
  }
})

onMounted(async () => {
  await loadTodos()
  setupRealtimeSubscription()
})

onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe()
  }
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

/* 配置相关样式 */
.config-notice {
  padding: 1rem;
  margin-bottom: 1rem;
  background: var(--vp-c-yellow-soft);
  border: 1px solid var(--vp-c-yellow);
  border-radius: 6px;
}

.config-notice h4 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
}

.config-notice p {
  margin: 0 0 0.75rem 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.btn-config {
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-config:hover {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

.config-form {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.config-input {
  padding: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
}

.btn-save-config {
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 4px;
  background: var(--vp-c-brand-1);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-save-config:hover {
  background: var(--vp-c-brand-2);
}

.setup-link {
  color: var(--vp-c-brand-1);
  font-size: 0.85rem;
  text-decoration: none;
}

.setup-link:hover {
  text-decoration: underline;
}

/* 错误提示 */
.error-banner {
  padding: 0.75rem;
  margin-bottom: 1rem;
  background: var(--vp-c-red-soft);
  border: 1px solid var(--vp-c-red);
  border-radius: 6px;
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  gap: 1rem;
  color: var(--vp-c-text-2);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sync-badge {
  font-size: 1rem;
  opacity: 0.7;
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

.btn-add:disabled, .btn-filter:disabled, .btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
