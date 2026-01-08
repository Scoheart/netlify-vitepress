-- 创建 daily_records 表（替代原 todos 表）
create table daily_records (
  id text primary key,
  type text check (type in ('question', 'todo', 'insight', 'note')) not null,
  content text not null,
  date text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Todo 专属字段
  completed boolean default false,
  priority text check (priority in ('low', 'medium', 'high')),

  -- Question 专属字段
  answer text,

  -- Insight 专属字段
  tags text[], -- 分类标签数组，如 ['技术', '思维']

  -- 可选：通用元数据
  metadata jsonb default '{}'::jsonb
);

-- 创建索引以提升查询性能
create index daily_records_date_idx on daily_records (date);
create index daily_records_type_idx on daily_records (type);
create index daily_records_created_at_idx on daily_records (created_at);
create index daily_records_date_type_idx on daily_records (date, type);

-- 启用行级安全策略（RLS）
alter table daily_records enable row level security;

-- 允许所有人读写（适合个人博客）
-- 注意：如果需要更严格的安全控制，可以添加身份验证并修改此策略
create policy "Enable all access for daily_records"
  on daily_records for all
  using (true)
  with check (true);

-- 迁移脚本：如果你已经有 todos 表，可以使用以下脚本迁移数据
-- 注意：执行前请备份数据！
/*
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
*/
