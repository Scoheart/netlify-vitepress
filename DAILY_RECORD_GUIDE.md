# DailyRecord 系统部署和使用指南

## 📋 概述

DailyRecord 是一个多功能的每日记录系统，支持 4 种记录类型：
- **Question** ❓ - 记录学习中的疑问和答案
- **Todo** ✓ - 管理每日任务（支持优先级和完成状态）
- **Insight** 💡 - 记录学习收获和洞察（支持分类标签）
- **Note** 📝 - 通用笔记和备忘

## 🚀 快速开始

### 1. 更新 Supabase 数据库

#### 创建新表

1. 登录 [Supabase Dashboard](https://supabase.com)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 复制 `supabase-setup.sql` 的内容并执行

#### 数据迁移（如果你已有旧的 todos 表）

在 `supabase-setup.sql` 末尾有迁移脚本（被注释）：

```sql
-- 取消以下注释以执行迁移
insert into daily_records (id, type, content, date, created_at, completed, priority)
select
  id,
  'todo' as type,
  text as content,
  date,
  created_at,
  completed,
  priority
from todos;
```

**⚠️ 执行前请备份数据！**

### 2. 本地测试

```bash
# 确保环境变量配置正确
cat .env

# 应该看到：
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# 重启开发服务器（重要！）
pnpm dev

# 访问日记页面
open http://localhost:5173/daily/2026/January/9th
```

### 3. 浏览器控制台验证

打开浏览器开发者工具（F12），应该看到：

```
[Supabase Debug] URL: https://your-project.supabase.co
[Supabase Debug] Key: ✓ exists
```

如果显示 `✗ missing`，说明环境变量未加载，需要重启开发服务器。

## 📖 功能测试

### Question 类型测试

1. 切换到 "❓ Question" Tab
2. 在"输入问题"框中输入：
   ```
   什么是 TypeScript 的类型守卫？
   ```
3. （可选）在"答案"框中输入答案，或稍后添加
4. 点击"添加"
5. 如果没有添加答案，点击"添加答案"按钮补充

**验证点：**
- ✓ 问题正确显示
- ✓ 答案以绿色背景显示
- ✓ 时间戳正确
- ✓ 数据保存到 Supabase

### Todo 类型测试

1. 切换到 "✓ Todo" Tab
2. 输入任务：
   ```
   学习 Vue 3 Composition API
   ```
3. 选择优先级：**高**
4. 点击"添加"
5. 切换完成状态（点击复选框）

**验证点：**
- ✓ 任务正确显示
- ✓ 优先级标签显示正确颜色
- ✓ 完成状态切换正常
- ✓ 完成后文字有删除线
- ✓ 云端同步（打开另一个浏览器标签验证）

### Insight 类型测试

1. 切换到 "💡 Insight" Tab
2. 输入洞察：
   ```
   TypeScript 的类型守卫可以通过 typeof、instanceof 等方式缩窄联合类型
   ```
3. 标签输入：
   ```
   技术,TypeScript,类型系统
   ```
4. 点击"添加"

**验证点：**
- ✓ 洞察内容正确显示
- ✓ 标签显示为蓝色胶囊状
- ✓ 支持多个标签

### Note 类型测试

1. 切换到 "📝 Note" Tab
2. 输入多行笔记：
   ```
   今天学习了 Vue 3 的新特性：
   - Composition API
   - Teleport
   - Fragments
   ```
3. 点击"添加"

**验证点：**
- ✓ 笔记支持多行文本
- ✓ 换行正确保留

## 🎨 使用技巧

### 快捷键

- **Ctrl + Enter**（在多行文本框中）- 快速提交

### Tab 统计

每个 Tab 右侧显示当前类型的记录数量，方便快速了解今天记录了多少内容。

### 云端同步

如果配置了 Supabase：
- 标题旁边会显示 ☁️ 图标
- 所有操作实时同步到云端
- 支持跨设备访问

### 本地降级

如果 Supabase 未配置：
- 显示配置提示
- 可以通过表单手动配置
- 配置保存到 localStorage

## 🗂️ 目录结构

```
daily/
└── 2026/
    └── January/
        ├── 4th.md
        └── 9th.md
```

**文件命名规则：**
- 年份：4 位数字（如 `2026`）
- 月份：英文全称（如 `January`）
- 日期：序数词格式（如 `4th`, `9th`, `21st`）

**序数词规则：**
- 1, 21, 31 → 1st, 21st, 31st
- 2, 22 → 2nd, 22nd
- 3, 23 → 3rd, 23rd
- 其他 → 4th, 5th, 6th...

## 📊 数据库表结构

```sql
daily_records (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,  -- 'question' | 'todo' | 'insight' | 'note'
  content TEXT NOT NULL,
  date TEXT NOT NULL,  -- YYYY-MM-DD
  created_at TIMESTAMP,

  -- Todo 专属字段
  completed BOOLEAN,
  priority TEXT,  -- 'low' | 'medium' | 'high'

  -- Question 专属字段
  answer TEXT,

  -- Insight 专属字段
  tags TEXT[],

  -- 通用元数据
  metadata JSONB
)
```

## 🔍 故障排查

### 问题：页面显示"Supabase 未配置"

**解决方案：**
1. 检查 `.env` 文件是否存在
2. 确认环境变量名正确（`VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`）
3. 重启开发服务器（`pnpm dev`）
4. 清除浏览器缓存

### 问题：添加记录后报错

**可能原因：**
1. Supabase 表未创建 → 执行 `supabase-setup.sql`
2. RLS 策略未配置 → 检查 SQL 脚本中的策略部分
3. 网络问题 → 检查浏览器控制台的网络请求

### 问题：云端同步不工作

**检查清单：**
1. 确认 Supabase Realtime 已启用
2. 检查浏览器控制台是否有 WebSocket 错误
3. 验证 Anon Key 是否正确
4. 确认表名为 `daily_records`（不是 `todos`）

## 🚢 部署到 Netlify

### 步骤 1: 配置环境变量

1. 登录 [Netlify Dashboard](https://app.netlify.com/)
2. 选择你的项目
3. 进入 **Site configuration** → **Environment variables**
4. 添加两个变量：

```
变量 1:
  Key:   VITE_SUPABASE_URL
  Value: https://your-project.supabase.co
  Scope: All (或 Production)

变量 2:
  Key:   VITE_SUPABASE_ANON_KEY
  Value: your-anon-key
  Scope: All (或 Production)
```

### 步骤 2: 触发重新部署

1. 进入 **Deploys** 标签
2. 点击 **Trigger deploy** → **Clear cache and deploy site**
3. 等待构建完成（约 1-2 分钟）

### 步骤 3: 验证部署

访问你的网站，打开浏览器控制台，应该看到：

```
[Supabase Debug] URL: https://your-project.supabase.co
[Supabase Debug] Key: ✓ exists
```

## 📚 最佳实践

### 记录建议

- **Question**: 记录学习中的疑问，找到答案后及时补充
- **Todo**: 每天早上规划任务，晚上回顾完成情况
- **Insight**: 随时记录学习收获，定期回顾加深理解
- **Note**: 记录临时想法、会议笔记等

### 数据组织

- 每天一个文件，保持独立性
- 使用标签（Insight）进行主题分类
- 定期回顾和总结（可以创建周总结、月总结）

### 安全建议

- 不要在 Git 中提交 `.env` 文件
- 定期备份 Supabase 数据
- 如果需要更严格的安全控制，修改 RLS 策略添加身份验证

## 🎯 未来扩展

当前系统为基础版本，未来可以添加：

- [ ] 搜索功能（按内容、标签搜索）
- [ ] 日历视图（可视化查看每天的记录）
- [ ] 数据导出（导出为 Markdown、JSON）
- [ ] 统计面板（记录数量趋势、标签云）
- [ ] 富文本编辑器（支持代码高亮、图片）
- [ ] 移动端适配（响应式设计）

## 📞 支持

如果遇到问题：
1. 检查浏览器控制台错误
2. 查看 Supabase Dashboard 的日志
3. 参考本指南的故障排查部分

祝使用愉快！🎉
