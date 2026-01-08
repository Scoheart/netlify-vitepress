<template>
  <div class="daily-record-container">
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
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-banner">
      ⚠️ {{ error }}
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading && allRecords.length === 0" class="loading-state">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- 主界面 -->
    <div v-else>
      <div class="record-header">
        <h3>
          {{ title }}
          <span v-if="isConfigured" class="sync-badge" title="已启用云端同步">☁️</span>
        </h3>
        <div class="record-stats">
          <span class="total-count">共 {{ allRecords.length }} 条记录</span>
        </div>
      </div>

      <!-- Tab 切换 -->
      <div class="tab-container">
        <button
          v-for="tab in tabs"
          :key="tab.type"
          @click="currentTab = tab.type"
          :class="['tab-button', { active: currentTab === tab.type }]"
        >
          {{ tab.icon }} {{ tab.label }}
          <span class="count-badge">{{ getRecordsByType(tab.type).length }}</span>
        </button>
      </div>

      <!-- 添加按钮 -->
      <div class="add-section">
        <button @click="showAddForm = !showAddForm" class="btn-add" :disabled="isLoading">
          {{ showAddForm ? '取消' : `+ 添加${tabs.find(t => t.type === currentTab)?.label}` }}
        </button>
      </div>

      <!-- 添加表单 -->
      <div v-if="showAddForm" class="add-form">
        <!-- Question 表单 -->
        <div v-if="currentTab === 'question'" class="form-question">
          <textarea
            v-model="newRecord.content"
            @keyup.ctrl.enter="handleAddRecord"
            placeholder="输入问题..."
            class="record-textarea"
            rows="3"
            :disabled="isLoading"
          />
          <textarea
            v-model="newRecord.answer"
            placeholder="答案（可选，稍后添加）"
            class="record-textarea"
            rows="2"
            :disabled="isLoading"
          />
          <button @click="handleAddRecord" class="btn-submit" :disabled="isLoading">
            {{ isLoading ? '添加中...' : '添加' }}
          </button>
        </div>

        <!-- Todo 表单 -->
        <div v-if="currentTab === 'todo'" class="form-todo">
          <input
            v-model="newRecord.content"
            @keyup.enter="handleAddRecord"
            placeholder="输入任务..."
            class="record-input"
            :disabled="isLoading"
          />
          <select v-model="newRecord.priority" class="priority-select" :disabled="isLoading">
            <option value="low">低优先级</option>
            <option value="medium">中优先级</option>
            <option value="high">高优先级</option>
          </select>
          <button @click="handleAddRecord" class="btn-submit" :disabled="isLoading">
            {{ isLoading ? '添加中...' : '添加' }}
          </button>
        </div>

        <!-- Insight 表单 -->
        <div v-if="currentTab === 'insight'" class="form-insight">
          <textarea
            v-model="newRecord.content"
            @keyup.ctrl.enter="handleAddRecord"
            placeholder="输入洞察/收获..."
            class="record-textarea"
            rows="4"
            :disabled="isLoading"
          />
          <input
            v-model="newRecord.tagsInput"
            @keyup.enter="handleAddRecord"
            placeholder="标签（用逗号分隔，如：技术,思维）"
            class="record-input"
            :disabled="isLoading"
          />
          <button @click="handleAddRecord" class="btn-submit" :disabled="isLoading">
            {{ isLoading ? '添加中...' : '添加' }}
          </button>
        </div>

        <!-- Note 表单 -->
        <div v-if="currentTab === 'note'" class="form-note">
          <textarea
            v-model="newRecord.content"
            @keyup.ctrl.enter="handleAddRecord"
            placeholder="输入笔记..."
            class="record-textarea"
            rows="4"
            :disabled="isLoading"
          />
          <button @click="handleAddRecord" class="btn-submit" :disabled="isLoading">
            {{ isLoading ? '添加中...' : '添加' }}
          </button>
        </div>
      </div>

      <!-- 记录列表 -->
      <div class="record-items">
        <TransitionGroup name="record">
          <template v-for="record in currentRecords" :key="record.id">
            <!-- Question 记录 -->
            <div
              v-if="record.type === 'question'"
              class="record-item record-question"
            >
              <div class="record-content">
                <div class="question-text">❓ {{ record.content }}</div>
                <div v-if="record.answer" class="answer-text">
                  💡 <strong>答案：</strong>{{ record.answer }}
                </div>
                <button
                  v-else
                  @click="showAnswerForm(record)"
                  class="btn-add-answer"
                >
                  添加答案
                </button>
              </div>
              <div class="record-actions">
                <span class="record-time">{{ formatTime(record.created_at) }}</span>
                <button @click="handleDelete(record.id)" class="btn-delete" :disabled="isLoading">
                  删除
                </button>
              </div>
            </div>

            <!-- Todo 记录 -->
            <div
              v-else-if="record.type === 'todo'"
              :class="['record-item', 'record-todo', `priority-${record.priority}`, { completed: record.completed }]"
            >
              <input
                type="checkbox"
                :checked="record.completed"
                @change="handleToggleTodo(record)"
                class="todo-checkbox"
                :disabled="isLoading"
              />
              <div class="record-content">
                <span class="todo-text">{{ record.content }}</span>
                <span class="priority-badge">{{ getPriorityLabel(record.priority) }}</span>
              </div>
              <div class="record-actions">
                <span class="record-time">{{ formatTime(record.created_at) }}</span>
                <button @click="handleDelete(record.id)" class="btn-delete" :disabled="isLoading">
                  删除
                </button>
              </div>
            </div>

            <!-- Insight 记录 -->
            <div
              v-else-if="record.type === 'insight'"
              class="record-item record-insight"
            >
              <div class="record-content">
                <div class="insight-text">💡 {{ record.content }}</div>
                <div v-if="record.tags && record.tags.length > 0" class="insight-tags">
                  <span v-for="tag in record.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
              <div class="record-actions">
                <span class="record-time">{{ formatTime(record.created_at) }}</span>
                <button @click="handleDelete(record.id)" class="btn-delete" :disabled="isLoading">
                  删除
                </button>
              </div>
            </div>

            <!-- Note 记录 -->
            <div
              v-else-if="record.type === 'note'"
              class="record-item record-note"
            >
              <div class="record-content">
                <div class="note-text">📝 {{ record.content }}</div>
              </div>
              <div class="record-actions">
                <span class="record-time">{{ formatTime(record.created_at) }}</span>
                <button @click="handleDelete(record.id)" class="btn-delete" :disabled="isLoading">
                  删除
                </button>
              </div>
            </div>
          </template>
        </TransitionGroup>

        <div v-if="currentRecords.length === 0" class="empty-state">
          暂无{{ tabs.find(t => t.type === currentTab)?.label }}记录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useSupabase, type DailyRecord, type TodoRecord, type QuestionRecord, type InsightRecord } from '../composables/useSupabase'

const props = defineProps<{
  date?: string
  title?: string
}>()

const { isConfigured, isLoading, error, saveConfig, getRecords, createRecord, updateRecord, deleteRecord, subscribeRecords } = useSupabase()

// 状态
const currentDate = props.date || new Date().toISOString().split('T')[0]
const allRecords = ref<DailyRecord[]>([])
const currentTab = ref<'question' | 'todo' | 'insight' | 'note'>('todo')
const showAddForm = ref(false)
const showConfig = ref(false)
const supabaseUrl = ref('')
const supabaseKey = ref('')

// Tab 配置
const tabs = [
  { type: 'question' as const, label: 'Question', icon: '❓' },
  { type: 'todo' as const, label: 'Todo', icon: '✓' },
  { type: 'insight' as const, label: 'Insight', icon: '💡' },
  { type: 'note' as const, label: 'Note', icon: '📝' }
]

// 新记录表单
const newRecord = ref({
  content: '',
  answer: '',
  priority: 'medium' as 'low' | 'medium' | 'high',
  tagsInput: ''
})

// 计算属性
const currentRecords = computed(() => {
  return allRecords.value.filter(r => r.type === currentTab.value)
})

// 获取指定类型的记录
const getRecordsByType = (type: string) => {
  return allRecords.value.filter(r => r.type === type)
}

// 加载记录
const loadRecords = async () => {
  if (!isConfigured.value) {
    console.log('[DailyRecord] Supabase not configured, skipping load')
    return
  }

  const data = await getRecords(currentDate)
  if (data.length > 0 || allRecords.value.length === 0) {
    allRecords.value = data
  }
}

// 添加记录
const handleAddRecord = async () => {
  if (!newRecord.value.content.trim()) return

  const baseRecord = {
    id: crypto.randomUUID(),
    type: currentTab.value,
    content: newRecord.value.content.trim(),
    date: currentDate
  }

  let recordData: any = { ...baseRecord }

  // 根据类型添加特定字段
  if (currentTab.value === 'question') {
    recordData.answer = newRecord.value.answer.trim() || undefined
  } else if (currentTab.value === 'todo') {
    recordData.completed = false
    recordData.priority = newRecord.value.priority
  } else if (currentTab.value === 'insight') {
    const tags = newRecord.value.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t)
    recordData.tags = tags.length > 0 ? tags : undefined
  }

  const created = await createRecord(recordData)

  if (created) {
    allRecords.value.unshift(created)
    // 重置表单
    newRecord.value.content = ''
    newRecord.value.answer = ''
    newRecord.value.priority = 'medium'
    newRecord.value.tagsInput = ''
    showAddForm.value = false
  }
}

// 切换 Todo 完成状态
const handleToggleTodo = async (record: TodoRecord) => {
  const success = await updateRecord(record.id, {
    completed: !record.completed
  })

  if (success) {
    const index = allRecords.value.findIndex(r => r.id === record.id)
    if (index !== -1) {
      ;(allRecords.value[index] as TodoRecord).completed = !record.completed
    }
  }
}

// 删除记录
const handleDelete = async (id: string) => {
  if (!confirm('确定要删除这条记录吗？')) return

  const success = await deleteRecord(id)

  if (success) {
    allRecords.value = allRecords.value.filter(r => r.id !== id)
  }
}

// 显示添加答案表单
const showAnswerForm = (record: QuestionRecord) => {
  const answer = prompt('输入答案：', record.answer || '')
  if (answer !== null) {
    handleUpdateAnswer(record.id, answer)
  }
}

// 更新答案
const handleUpdateAnswer = async (id: string, answer: string) => {
  const success = await updateRecord(id, { answer })

  if (success) {
    const index = allRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      ;(allRecords.value[index] as QuestionRecord).answer = answer
    }
  }
}

// 保存配置
const handleSaveConfig = () => {
  if (supabaseUrl.value && supabaseKey.value) {
    saveConfig(supabaseUrl.value, supabaseKey.value)
    showConfig.value = false
    loadRecords()
  }
}

// 格式化时间
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 获取优先级标签
const getPriorityLabel = (priority: 'low' | 'medium' | 'high') => {
  const labels = { low: '低', medium: '中', high: '高' }
  return labels[priority]
}

// 订阅
let subscription: any = null

onMounted(async () => {
  await loadRecords()

  if (isConfigured.value) {
    subscription = subscribeRecords(currentDate, (updatedRecords) => {
      allRecords.value = updatedRecords
    })
  }
})

onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe()
  }
})
</script>

<style scoped>
/* ============================================
   DailyRecord - 与博客主题融合的设计
   使用 VitePress CSS 变量保持一致性
   ============================================ */

.daily-record-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

/* ============================================
   配置提示 - 玻璃态设计
   ============================================ */
.config-notice {
  background: rgba(155, 126, 217, 0.08);
  border: 1px solid rgba(155, 126, 217, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.dark .config-notice {
  background: rgba(155, 126, 217, 0.12);
  border-color: rgba(183, 148, 246, 0.25);
}

.config-notice h4 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.config-notice p {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-2);
}

.btn-config {
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(155, 126, 217, 0.3);
}

.btn-config:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(155, 126, 217, 0.4);
}

.config-form {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.config-input {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(155, 126, 217, 0.3);
  border-radius: 8px;
  font-size: 0.95rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.config-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px rgba(155, 126, 217, 0.15);
}

.btn-save-config {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.btn-save-config:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* ============================================
   错误提示
   ============================================ */
.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  backdrop-filter: blur(8px);
}

.dark .error-banner {
  background: rgba(239, 68, 68, 0.15);
}

/* ============================================
   加载状态
   ============================================ */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem;
  color: var(--vp-c-text-2);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(155, 126, 217, 0.2);
  border-top: 2px solid var(--vp-c-brand-1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ============================================
   头部
   ============================================ */
.record-header {
  margin-bottom: 1.5rem;
}

.record-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--vp-c-text-1);
}

.sync-badge {
  font-size: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.record-stats {
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
}

/* ============================================
   Tab 切换 - 现代胶囊设计
   ============================================ */
.tab-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.375rem;
  background: rgba(155, 126, 217, 0.06);
  border-radius: 12px;
  border: 1px solid rgba(155, 126, 217, 0.1);
}

.dark .tab-container {
  background: rgba(155, 126, 217, 0.08);
  border-color: rgba(183, 148, 246, 0.15);
}

.tab-button {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  border-radius: 8px;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab-button:hover:not(.active) {
  color: var(--vp-c-text-1);
  background: rgba(155, 126, 217, 0.08);
}

.tab-button.active {
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  color: white;
  box-shadow: 0 2px 12px rgba(155, 126, 217, 0.35);
}

.count-badge {
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  min-width: 1.25rem;
  text-align: center;
}

.tab-button:not(.active) .count-badge {
  background: rgba(155, 126, 217, 0.15);
}

/* ============================================
   添加按钮
   ============================================ */
.add-section {
  margin-bottom: 1rem;
}

.btn-add {
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(155, 126, 217, 0.3);
}

.btn-add:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(155, 126, 217, 0.45);
}

.btn-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* ============================================
   添加表单 - 玻璃态卡片
   ============================================ */
.add-form {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(155, 126, 217, 0.15);
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.dark .add-form {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(183, 148, 246, 0.2);
}

.add-form > div {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.record-input,
.record-textarea {
  padding: 0.875rem 1rem;
  border: 1px solid rgba(155, 126, 217, 0.2);
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.record-input:focus,
.record-textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px rgba(155, 126, 217, 0.12);
}

.record-input::placeholder,
.record-textarea::placeholder {
  color: var(--vp-c-text-3);
}

.priority-select {
  padding: 0.875rem 1rem;
  border: 1px solid rgba(155, 126, 217, 0.2);
  border-radius: 10px;
  font-size: 0.95rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.priority-select:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px rgba(155, 126, 217, 0.12);
}

.btn-submit {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  align-self: flex-start;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* ============================================
   记录列表
   ============================================ */
.record-items {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

/* ============================================
   记录卡片 - 玻璃态 + 类型色彩
   ============================================ */
.record-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 1.125rem 1.25rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
}

.dark .record-item {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.06);
}

.record-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 3px 0 0 3px;
}

.record-item:hover {
  transform: translateY(-2px);
  border-color: rgba(155, 126, 217, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.dark .record-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.record-content {
  flex: 1;
  min-width: 0;
}

.record-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.record-time {
  color: var(--vp-c-text-3);
  font-size: 0.8rem;
}

.btn-delete {
  background: transparent;
  color: var(--vp-c-text-3);
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.btn-delete:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

/* ============================================
   Question 样式 - 红色调
   ============================================ */
.record-question::before {
  background: linear-gradient(180deg, #f87171, #ef4444);
}

.question-text {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
}

.answer-text {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.15);
  padding: 0.875rem 1rem;
  border-radius: 10px;
  margin-top: 0.75rem;
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.dark .answer-text {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.2);
}

.btn-add-answer {
  background: transparent;
  color: var(--vp-c-brand-1);
  border: 1px solid rgba(155, 126, 217, 0.3);
  padding: 0.4rem 0.875rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  transition: all 0.2s ease;
}

.btn-add-answer:hover {
  background: rgba(155, 126, 217, 0.1);
  border-color: var(--vp-c-brand-1);
}

/* ============================================
   Todo 样式 - 品牌紫色
   ============================================ */
.record-todo::before {
  background: linear-gradient(180deg, var(--vp-c-brand-2), var(--vp-c-brand-1));
}

.record-todo.completed {
  opacity: 0.55;
}

.record-todo.completed .todo-text {
  text-decoration: line-through;
  color: var(--vp-c-text-3);
}

.todo-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 0.125rem;
  accent-color: var(--vp-c-brand-1);
}

.todo-text {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--vp-c-text-1);
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-left: 0.625rem;
}

.priority-high .priority-badge {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.priority-medium .priority-badge {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.priority-low .priority-badge {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

/* ============================================
   Insight 样式 - 金色调
   ============================================ */
.record-insight::before {
  background: linear-gradient(180deg, #fbbf24, #f59e0b);
}

.insight-text {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
}

.insight-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.625rem;
}

.tag {
  background: rgba(155, 126, 217, 0.12);
  color: var(--vp-c-brand-1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid rgba(155, 126, 217, 0.2);
  transition: all 0.2s ease;
}

.tag:hover {
  background: rgba(155, 126, 217, 0.2);
}

/* ============================================
   Note 样式 - 灰色调
   ============================================ */
.record-note::before {
  background: linear-gradient(180deg, #9ca3af, #6b7280);
}

.note-text {
  font-size: 1rem;
  line-height: 1.7;
  white-space: pre-wrap;
  color: var(--vp-c-text-1);
}

/* ============================================
   空状态
   ============================================ */
.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--vp-c-text-3);
  font-size: 1rem;
}

.empty-state::before {
  content: '✨';
  display: block;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* ============================================
   过渡动画
   ============================================ */
.record-enter-active,
.record-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.record-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
}

.record-leave-to {
  opacity: 0;
  transform: translateX(24px) scale(0.98);
}

/* ============================================
   响应式设计
   ============================================ */
@media (max-width: 640px) {
  .tab-container {
    flex-wrap: wrap;
  }

  .tab-button {
    flex: none;
    padding: 0.625rem 0.875rem;
    font-size: 0.85rem;
  }

  .record-item {
    padding: 1rem;
  }

  .record-actions {
    flex-direction: row;
    align-items: center;
    margin-top: 0.75rem;
  }
}
</style>
