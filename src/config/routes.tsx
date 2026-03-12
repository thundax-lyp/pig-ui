import {
    Blocks,
    BookText,
    Bot,
    ChartColumnBig,
    Database,
    FileText,
    FolderCog,
    House,
    KeyRound,
    LayoutGrid,
    LockKeyhole,
    NotebookTabs,
    PackageSearch,
    ScrollText,
    ShieldCheck,
    Users,
    Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type RouteMeta = {
    path: string;
    label: string;
    description: string;
    group: string;
    icon: LucideIcon;
};

export const appRoutes: RouteMeta[] = [
    { path: '/home', label: '工作台', description: '概览、快捷入口与系统动态。', group: '概览', icon: House },
    { path: '/daemon/job-manage/index', label: '任务管理', description: '调度任务、执行日志与运行窗口。', group: '运维', icon: Bot },
    { path: '/admin/user/index', label: '用户管理', description: '用户、组织归属、状态与角色绑定。', group: '系统', icon: Users },
    { path: '/admin/role/index', label: '角色管理', description: '角色授权、菜单能力与权限边界。', group: '系统', icon: ShieldCheck },
    { path: '/admin/menu/index', label: '菜单管理', description: '导航结构、前端入口与权限映射。', group: '系统', icon: LayoutGrid },
    { path: '/admin/dept/index', label: '部门管理', description: '组织树、数据隔离与管理范围。', group: '系统', icon: NotebookTabs },
    { path: '/admin/post/index', label: '岗位管理', description: '岗位定义与人员职责分配。', group: '系统', icon: FolderCog },
    { path: '/admin/dict/index', label: '字典管理', description: '字典项配置、枚举维护与复用。', group: '系统', icon: BookText },
    { path: '/admin/param/index', label: '参数管理', description: '系统参数、运行时配置与开关项。', group: '系统', icon: Wrench },
    { path: '/admin/client/index', label: '客户端管理', description: 'OAuth 客户端、范围、密钥与回调。', group: '系统', icon: LockKeyhole },
    { path: '/admin/token/index', label: '令牌管理', description: '在线会话、刷新令牌与访问状态。', group: '系统', icon: KeyRound },
    { path: '/admin/log/index', label: '日志管理', description: '审计日志、事件追踪与告警线索。', group: '系统', icon: ScrollText },
    { path: '/admin/file/index', label: '文件管理', description: '资源归档、对象预览与下载控制。', group: '系统', icon: FileText },
    { path: '/gen/datasource/index', label: '数据源', description: '多数据源接入、联通性和元信息。', group: '生成', icon: Database },
    { path: '/gen/field-type/index', label: '字段类型', description: '字段映射、模板约束与类型预设。', group: '生成', icon: Blocks },
    { path: '/gen/group/index', label: '分组管理', description: '业务分组、模板分类与生成归属。', group: '生成', icon: PackageSearch },
    { path: '/gen/table/index', label: '表管理', description: '表结构、预览、编辑和代码生成。', group: '生成', icon: ChartColumnBig },
    { path: '/gen/template/index', label: '模板管理', description: '模板版本、规则与输出策略。', group: '生成', icon: FileText },
    { path: '/gen/design/index', label: '在线设计', description: '字段布局、交互编排和页面生成。', group: '生成', icon: LayoutGrid },
    { path: '/gen/gener/index', label: '代码生成', description: '生成任务、包结构与产物追踪。', group: '生成', icon: Bot },
    { path: '/ext/cache', label: '缓存监控', description: '缓存命中、容量变化与热点分布。', group: '扩展', icon: Database },
];

export const routeGroups = Array.from(new Set(appRoutes.map((route) => route.group)));

export const findRouteMetaByPath = (path: string) => {
    return appRoutes.find((route) => route.path === path);
};
