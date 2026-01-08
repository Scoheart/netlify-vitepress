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
-- 注意：如果需要更严格的安全控制，可以添加身份验证并修改此策略
create policy "Enable all access for todos"
  on todos for all
  using (true)
  with check (true);
