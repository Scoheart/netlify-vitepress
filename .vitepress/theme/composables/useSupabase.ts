import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { ref } from 'vue'

let supabaseClient: SupabaseClient | null = null

// 基础记录接口
export interface BaseDailyRecord {
  id: string
  type: 'question' | 'todo' | 'insight' | 'note'
  content: string
  date: string // YYYY-MM-DD 格式
  created_at: string
}

// Question 类型记录
export interface QuestionRecord extends BaseDailyRecord {
  type: 'question'
  answer?: string
}

// Todo 类型记录
export interface TodoRecord extends BaseDailyRecord {
  type: 'todo'
  completed: boolean
  priority: 'low' | 'medium' | 'high'
}

// Insight 类型记录
export interface InsightRecord extends BaseDailyRecord {
  type: 'insight'
  tags?: string[]
}

// Note 类型记录
export interface NoteRecord extends BaseDailyRecord {
  type: 'note'
}

// 联合类型
export type DailyRecord = QuestionRecord | TodoRecord | InsightRecord | NoteRecord

// 数据库记录类型（包含所有可选字段）
export interface DailyRecordDB {
  id: string
  type: 'question' | 'todo' | 'insight' | 'note'
  content: string
  date: string
  created_at: string
  // 可选字段
  completed?: boolean
  priority?: 'low' | 'medium' | 'high'
  answer?: string
  tags?: string[]
  metadata?: Record<string, any>
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

  // 获取某一天的所有记录（可按类型筛选）
  const getRecords = async (
    date: string,
    type?: 'question' | 'todo' | 'insight' | 'note'
  ): Promise<DailyRecord[]> => {
    const client = initSupabase()
    if (!client) {
      error.value = 'Supabase 未配置'
      return []
    }

    isLoading.value = true
    error.value = null

    try {
      let query = client
        .from('daily_records')
        .select('*')
        .eq('date', date)

      if (type) {
        query = query.eq('type', type)
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return (data || []) as DailyRecord[]
    } catch (e: any) {
      error.value = e.message || '获取记录失败'
      console.error(e)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 创建新记录
  const createRecord = async (record: Omit<DailyRecordDB, 'created_at'>): Promise<DailyRecord | null> => {
    const client = initSupabase()
    if (!client) {
      error.value = 'Supabase 未配置'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await client
        .from('daily_records')
        .insert([record])
        .select()
        .single()

      if (insertError) throw insertError

      return data as DailyRecord
    } catch (e: any) {
      error.value = e.message || '创建记录失败'
      console.error(e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 更新记录
  const updateRecord = async (id: string, updates: Partial<DailyRecordDB>): Promise<boolean> => {
    const client = initSupabase()
    if (!client) {
      error.value = 'Supabase 未配置'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const { error: updateError } = await client
        .from('daily_records')
        .update(updates)
        .eq('id', id)

      if (updateError) throw updateError

      return true
    } catch (e: any) {
      error.value = e.message || '更新记录失败'
      console.error(e)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 删除记录
  const deleteRecord = async (id: string): Promise<boolean> => {
    const client = initSupabase()
    if (!client) {
      error.value = 'Supabase 未配置'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const { error: deleteError } = await client
        .from('daily_records')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      return true
    } catch (e: any) {
      error.value = e.message || '删除记录失败'
      console.error(e)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 订阅记录变化（实时同步）
  const subscribeRecords = (
    date: string,
    callback: (records: DailyRecord[]) => void,
    type?: 'question' | 'todo' | 'insight' | 'note'
  ) => {
    const client = initSupabase()
    if (!client) return null

    const channel = client
      .channel(`daily_records:${date}${type ? ':' + type : ''}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_records',
          filter: `date=eq.${date}`
        },
        async () => {
          // 当有变化时，重新获取数据
          const records = await getRecords(date, type)
          callback(records)
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
    getRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    subscribeRecords
  }
}
