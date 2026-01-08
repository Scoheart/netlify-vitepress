import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { ref } from 'vue'

let supabaseClient: SupabaseClient | null = null

export interface TodoRecord {
  id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  created_at: string
  date: string // 用于分组 todos（YYYY-MM-DD 格式）
}

export function useSupabase() {
  const isConfigured = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 从环境变量或 localStorage 获取配置
  const getConfig = () => {
    if (typeof window === 'undefined') return null

    // 优先使用构建时的环境变量
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    console.log('[Supabase Debug] URL:', supabaseUrl)
    console.log('[Supabase Debug] Key:', supabaseKey ? '✓ exists' : '✗ missing')

    if (supabaseUrl && supabaseKey) {
      return { supabaseUrl, supabaseKey }
    }

    // 回退到 localStorage（用于运行时配置）
    const storedUrl = localStorage.getItem('supabase_url')
    const storedKey = localStorage.getItem('supabase_anon_key')

    if (storedUrl && storedKey) {
      return { supabaseUrl: storedUrl, supabaseKey: storedKey }
    }

    return null
  }

  // 初始化 Supabase 客户端
  const initSupabase = () => {
    if (supabaseClient) {
      isConfigured.value = true
      return supabaseClient
    }

    const config = getConfig()
    if (!config) {
      isConfigured.value = false
      return null
    }

    try {
      supabaseClient = createClient(config.supabaseUrl, config.supabaseKey)
      isConfigured.value = true
      return supabaseClient
    } catch (e) {
      error.value = '初始化 Supabase 失败'
      console.error(e)
      return null
    }
  }

  // 保存配置到 localStorage
  const saveConfig = (url: string, key: string) => {
    if (typeof window === 'undefined') return

    localStorage.setItem('supabase_url', url)
    localStorage.setItem('supabase_anon_key', key)

    // 重新初始化客户端
    supabaseClient = null
    initSupabase()
  }

  // 获取某一天的所有 todos
  const getTodos = async (date: string): Promise<TodoRecord[]> => {
    const client = initSupabase()
    if (!client) {
      error.value = 'Supabase 未配置'
      return []
    }

    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await client
        .from('todos')
        .select('*')
        .eq('date', date)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return data || []
    } catch (e: any) {
      error.value = e.message || '获取任务失败'
      console.error(e)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 创建新 todo
  const createTodo = async (todo: Omit<TodoRecord, 'created_at'>): Promise<TodoRecord | null> => {
    const client = initSupabase()
    if (!client) {
      error.value = 'Supabase 未配置'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await client
        .from('todos')
        .insert([todo])
        .select()
        .single()

      if (insertError) throw insertError

      return data
    } catch (e: any) {
      error.value = e.message || '创建任务失败'
      console.error(e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 更新 todo
  const updateTodo = async (id: string, updates: Partial<TodoRecord>): Promise<boolean> => {
    const client = initSupabase()
    if (!client) {
      error.value = 'Supabase 未配置'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const { error: updateError } = await client
        .from('todos')
        .update(updates)
        .eq('id', id)

      if (updateError) throw updateError

      return true
    } catch (e: any) {
      error.value = e.message || '更新任务失败'
      console.error(e)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 删除 todo
  const deleteTodo = async (id: string): Promise<boolean> => {
    const client = initSupabase()
    if (!client) {
      error.value = 'Supabase 未配置'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const { error: deleteError } = await client
        .from('todos')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      return true
    } catch (e: any) {
      error.value = e.message || '删除任务失败'
      console.error(e)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 订阅 todos 变化（实时同步）
  const subscribeTodos = (date: string, callback: (todos: TodoRecord[]) => void) => {
    const client = initSupabase()
    if (!client) return null

    const channel = client
      .channel(`todos:${date}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `date=eq.${date}`
        },
        async () => {
          // 当有变化时，重新获取数据
          const todos = await getTodos(date)
          callback(todos)
        }
      )
      .subscribe()

    return channel
  }

  // 初始化时检查配置状态
  initSupabase()

  return {
    isConfigured,
    isLoading,
    error,
    saveConfig,
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    subscribeTodos
  }
}
