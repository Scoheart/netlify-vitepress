# Daily Insights

Recording my daily learning and thoughts.

## 如何使用 Todo List

在每一天的笔记中，你可以使用交互式 TodoList 组件来管理你的任务：

```vue
<TodoList title="今日任务" />
```

### 组件功能

- ✅ 添加、完成、删除任务
- 🎯 设置任务优先级（高/中/低）
- 🔍 按状态筛选（全部/进行中/已完成）
- ☁️ **跨设备同步（需配置 Supabase）**
- 📊 任务进度统计

### Supabase 设置指南 {#supabase-setup}

要启用跨设备同步功能，需要配置 Supabase 后端：

#### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并注册账号
2. 创建一个新项目
3. 等待项目初始化完成（约 2 分钟）

#### 2. 创建数据库表

在 Supabase Dashboard 中，进入 **SQL Editor**，执行以下 SQL：

```sql
-- 创建 todos 表
create table todos (
  id text primary key,
  text text not null,
  completed boolean default false,
  priority text check (priority in ('low', 'medium', 'high')),
  date text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建索引以提升查询性能
create index todos_date_idx on todos (date);
create index todos_created_at_idx on todos (created_at);

-- 启用行级安全策略（RLS）
alter table todos enable row level security;

-- 允许所有人读写（适合个人博客）
create policy "Enable all access for todos"
  on todos for all
  using (true)
  with check (true);
```

::: warning 安全提示
上述策略允许任何人访问你的 todos。如果需要更严格的安全控制，
可以添加身份验证并修改 RLS 策略。
:::

#### 3. 获取 API 密钥

1. 在 Supabase Dashboard 中，进入 **Settings** → **API**
2. 复制以下信息：
   - **Project URL**（形如 `https://xxx.supabase.co`）
   - **anon public** key

#### 4. 配置到博客

有两种配置方式：

**方式 1：运行时配置（推荐用于测试）**

直接在博客页面的配置界面中填入 URL 和 Key。

**方式 2：构建时配置（推荐用于生产）**

创建 `.env` 文件：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

::: tip
使用构建时配置时，请确保将 `.env` 添加到 `.gitignore`，
避免将敏感信息提交到代码仓库。
:::

#### 5. 启用实时同步（可选）

Supabase 项目默认启用实时功能。如需在多设备间实时同步：

1. 确保在 **Database** → **Replication** 中启用了 `todos` 表的 Realtime
2. 组件会自动订阅数据变化，无需额外配置

## 2026

- [2026-01-09](./2026/01-09)
- [2026-01-04](./2026/01-04)
