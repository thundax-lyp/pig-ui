import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, FolderPlus, LoaderCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { createMenu, deleteMenu, fetchMenuDetail, fetchMenuTree, updateMenu } from './service';
import type { MenuDetail, MenuNode } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type MenuFormState = MenuDetail;

const emptyForm: MenuFormState = {
    menuId: '',
    parentId: '-1',
    name: '',
    enName: '',
    path: '',
    permission: '',
    sortOrder: 0,
    menuType: '1',
    icon: '',
    keepAlive: '0',
    visible: '1',
    embedded: '0',
};

export const AdminMenuPage = () => {
    const [menus, setMenus] = useState<MenuNode[]>([]);
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [query, setQuery] = useState('');
    const [draftQuery, setDraftQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<MenuFormState>(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const parentOptions = useMemo(() => [{ id: '-1', name: '根菜单', depth: 0 }, ...flattenMenuOptions(menus)], [menus]);

    useEffect(() => {
        void loadMenus();
    }, []);

    async function loadMenus(nextQuery = query) {
        try {
            setLoading(true);
            const response = await fetchMenuTree(nextQuery ? { menuName: nextQuery } : undefined);
            setMenus(response.data ?? []);
            setExpandedIds(flattenMenuIds(response.data ?? []));
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '菜单树加载失败。' });
        } finally {
            setLoading(false);
        }
    }

    function handleSearch() {
        setQuery(draftQuery);
        void loadMenus(draftQuery);
    }

    function handleReset() {
        setDraftQuery('');
        setQuery('');
        void loadMenus('');
    }

    function toggleExpandAll() {
        setExpandedIds((prev) => (prev.length ? [] : flattenMenuIds(menus)));
    }

    function openCreateDialog(parent?: MenuNode) {
        setForm({
            ...emptyForm,
            parentId: parent?.id ?? '-1',
            menuType: parent?.menuType === '1' ? '1' : '0',
        });
        setErrors({});
        setDialogOpen(true);
    }

    async function openEditDialog(menu: MenuNode) {
        try {
            setSubmitting(true);
            const response = await fetchMenuDetail(menu.id);
            setForm({
                ...emptyForm,
                ...response.data,
            });
            setErrors({});
            setDialogOpen(true);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '菜单详情加载失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    function validateForm(state: MenuFormState) {
        const nextErrors: Record<string, string> = {};
        if (!state.parentId) nextErrors.parentId = '请选择上级菜单。';
        if (!state.name.trim()) nextErrors.name = '菜单名称不能为空。';
        if (state.menuType === '0' && !state.path.trim()) nextErrors.path = '菜单路径不能为空。';
        if (state.menuType === '0' && !state.icon.trim()) nextErrors.icon = '菜单图标不能为空。';
        if (state.menuType === '1' && !state.permission.trim()) nextErrors.permission = '权限标识不能为空。';
        return nextErrors;
    }

    async function handleSubmit() {
        const nextErrors = validateForm(form);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        try {
            setSubmitting(true);
            if (form.menuId) {
                await updateMenu(form);
                setFeedback({ type: 'success', message: '菜单已更新。' });
            } else {
                await createMenu(form);
                setFeedback({ type: 'success', message: '菜单已创建。' });
            }
            setDialogOpen(false);
            await loadMenus(query);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '菜单保存失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(menu: MenuNode) {
        if (menu.children?.length) return;
        if (!window.confirm(`确认删除菜单 ${menu.name} 吗？`)) return;

        try {
            setSubmitting(true);
            await deleteMenu(menu.id);
            setFeedback({ type: 'success', message: '菜单已删除。' });
            await loadMenus(query);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '菜单删除失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">菜单管理</CardTitle>
                        <CardDescription>支持搜索、展开收起、菜单新增编辑和树级删除。</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={toggleExpandAll}>
                            {expandedIds.length ? '全部收起' : '全部展开'}
                        </Button>
                        <Button onClick={() => openCreateDialog()}>
                            <Plus data-icon="inline-start" />
                            新增菜单
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {feedback ? (
                        <div
                            className={cn(
                                'rounded-2xl border px-4 py-3 text-sm',
                                feedback.type === 'success'
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-rose-200 bg-rose-50 text-rose-700'
                            )}
                        >
                            {feedback.message}
                        </div>
                    ) : null}

                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-10"
                                value={draftQuery}
                                onChange={(event) => setDraftQuery(event.target.value)}
                                placeholder="按菜单名称搜索"
                            />
                        </div>
                        <Button variant="outline" onClick={handleReset}>
                            重置
                        </Button>
                        <Button onClick={handleSearch}>查询</Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{`节点 ${flattenMenuIds(menus).length}`}</Badge>
                        <Badge variant="outline">菜单与按钮混合树</Badge>
                    </div>

                    <div className="overflow-hidden rounded-[28px] border border-border/70">
                        <div className="grid grid-cols-[minmax(240px,1.2fr)_100px_100px_minmax(180px,1fr)_100px_140px_120px_260px] bg-secondary/70 px-4 py-3 text-sm text-muted-foreground">
                            <div>名称</div>
                            <div>排序</div>
                            <div>图标</div>
                            <div>路径 / 权限</div>
                            <div>类型</div>
                            <div>缓存 / 显示</div>
                            <div>嵌套</div>
                            <div className="text-right">操作</div>
                        </div>
                        <div className="divide-y divide-border/60">
                            {loading ? (
                                <div className="px-4 py-16 text-center text-sm text-muted-foreground">
                                    <span className="inline-flex items-center gap-2">
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                        加载中
                                    </span>
                                </div>
                            ) : menus.length === 0 ? (
                                <div className="px-4 py-16 text-center text-sm text-muted-foreground">没有符合条件的菜单。</div>
                            ) : (
                                menus.map((menu) => (
                                    <MenuRow
                                        key={menu.id}
                                        node={menu}
                                        expandedIds={expandedIds}
                                        onToggleExpand={(id) =>
                                            setExpandedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
                                        }
                                        onAddChild={openCreateDialog}
                                        onEdit={openEditDialog}
                                        onDelete={handleDelete}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <MenuDialog
                open={dialogOpen}
                form={form}
                errors={errors}
                submitting={submitting}
                parentOptions={parentOptions}
                onOpenChange={setDialogOpen}
                onChange={setForm}
                onSubmit={() => void handleSubmit()}
            />
        </div>
    );
};

const MenuRow = ({
    node,
    expandedIds,
    onToggleExpand,
    onAddChild,
    onEdit,
    onDelete,
    depth = 0,
}: {
    node: MenuNode;
    expandedIds: string[];
    onToggleExpand: (id: string) => void;
    onAddChild: (node?: MenuNode) => void;
    onEdit: (node: MenuNode) => void;
    onDelete: (node: MenuNode) => void;
    depth?: number;
}) => {
    const expanded = expandedIds.includes(node.id);
    const hasChildren = Boolean(node.children?.length);

    return (
        <>
            <div className="grid grid-cols-[minmax(240px,1.2fr)_100px_100px_minmax(180px,1fr)_100px_140px_120px_260px] items-start px-4 py-4 text-sm">
                <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 18}px` }}>
                    <button type="button" className="text-muted-foreground" onClick={() => hasChildren && onToggleExpand(node.id)}>
                        {hasChildren ? (
                            expanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )
                        ) : (
                            <span className="inline-block h-4 w-4" />
                        )}
                    </button>
                    <span className="font-medium">{node.name}</span>
                </div>
                <div>{node.sortOrder ?? '-'}</div>
                <div className="text-muted-foreground">{node.meta?.icon || node.icon || '-'}</div>
                <div className="text-muted-foreground">{node.menuType === '0' ? node.path || '-' : node.permission || '-'}</div>
                <div>
                    <Badge variant={node.menuType === '1' ? 'outline' : 'secondary'}>
                        {node.menuType === '0' ? '菜单' : node.menuType === '2' ? '顶菜单' : '按钮'}
                    </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{node.meta?.isKeepAlive || node.keepAlive === '1' ? '缓存开' : '缓存关'}</Badge>
                    <Badge variant="outline">{node.visible === '1' || node.visible === undefined ? '显示' : '隐藏'}</Badge>
                </div>
                <div>{node.embedded === '1' ? '是' : '否'}</div>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onAddChild(node)}>
                        <FolderPlus data-icon="inline-start" />
                        新增
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(node)}>
                        <Pencil data-icon="inline-start" />
                        编辑
                    </Button>
                    <Button variant="ghost" size="sm" disabled={hasChildren} onClick={() => void onDelete(node)}>
                        <Trash2 data-icon="inline-start" />
                        删除
                    </Button>
                </div>
            </div>
            {hasChildren && expanded
                ? node.children!.map((child) => (
                    <MenuRow
                        key={child.id}
                        node={child}
                        expandedIds={expandedIds}
                        onToggleExpand={onToggleExpand}
                        onAddChild={onAddChild}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        depth={depth + 1}
                    />
                ))
                : null}
        </>
    );
};

const MenuDialog = ({
    open,
    form,
    errors,
    submitting,
    parentOptions,
    onOpenChange,
    onChange,
    onSubmit,
}: {
    open: boolean;
    form: MenuFormState;
    errors: Record<string, string>;
    submitting: boolean;
    parentOptions: Array<{ id: string; name: string; depth: number }>;
    onOpenChange: (open: boolean) => void;
    onChange: (form: MenuFormState) => void;
    onSubmit: () => void;
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{form.menuId ? '编辑菜单' : '新增菜单'}</DialogTitle>
                    <DialogDescription>编辑菜单、按钮和显示配置。</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="菜单类型" error={errors.menuType}>
                        <div className="flex gap-3">
                            <ToggleChip active={form.menuType === '0'} onClick={() => onChange({ ...form, menuType: '0' })}>
                                菜单
                            </ToggleChip>
                            <ToggleChip active={form.menuType === '1'} onClick={() => onChange({ ...form, menuType: '1' })}>
                                按钮
                            </ToggleChip>
                        </div>
                    </FormField>
                    <FormField label="上级菜单" error={errors.parentId}>
                        <select
                            className="h-12 w-full rounded-2xl border border-border/70 bg-background px-4 text-sm"
                            value={form.parentId}
                            onChange={(event) => onChange({ ...form, parentId: event.target.value })}
                        >
                            {parentOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {`${' '.repeat(option.depth * 2)}${option.name}`}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label="菜单名称" error={errors.name}>
                        <Input value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} />
                    </FormField>
                    <FormField label="英文名称">
                        <Input value={form.enName} onChange={(event) => onChange({ ...form, enName: event.target.value })} />
                    </FormField>
                    {form.menuType === '0' ? (
                        <>
                            <FormField label="路径" error={errors.path}>
                                <Input value={form.path} onChange={(event) => onChange({ ...form, path: event.target.value })} />
                            </FormField>
                            <FormField label="图标" error={errors.icon}>
                                <Input
                                    value={form.icon}
                                    onChange={(event) => onChange({ ...form, icon: event.target.value })}
                                    placeholder="例如 icon-shouye"
                                />
                            </FormField>
                        </>
                    ) : (
                        <FormField label="权限标识" error={errors.permission}>
                            <Input
                                value={form.permission}
                                onChange={(event) => onChange({ ...form, permission: event.target.value })}
                                placeholder="例如 sys_menu_add"
                            />
                        </FormField>
                    )}
                    <FormField label="排序">
                        <Input
                            type="number"
                            value={String(form.sortOrder)}
                            onChange={(event) => onChange({ ...form, sortOrder: Number(event.target.value || 0) })}
                        />
                    </FormField>
                </div>
                {form.menuType === '0' ? (
                    <div className="grid gap-4 md:grid-cols-3">
                        <FormField label="缓存">
                            <div className="flex gap-3">
                                <ToggleChip active={form.keepAlive === '1'} onClick={() => onChange({ ...form, keepAlive: '1' })}>
                                    开启
                                </ToggleChip>
                                <ToggleChip active={form.keepAlive === '0'} onClick={() => onChange({ ...form, keepAlive: '0' })}>
                                    关闭
                                </ToggleChip>
                            </div>
                        </FormField>
                        <FormField label="显示">
                            <div className="flex gap-3">
                                <ToggleChip active={form.visible === '1'} onClick={() => onChange({ ...form, visible: '1' })}>
                                    显示
                                </ToggleChip>
                                <ToggleChip active={form.visible === '0'} onClick={() => onChange({ ...form, visible: '0' })}>
                                    隐藏
                                </ToggleChip>
                            </div>
                        </FormField>
                        <FormField label="嵌套">
                            <div className="flex gap-3">
                                <ToggleChip active={form.embedded === '1'} onClick={() => onChange({ ...form, embedded: '1' })}>
                                    是
                                </ToggleChip>
                                <ToggleChip active={form.embedded === '0'} onClick={() => onChange({ ...form, embedded: '0' })}>
                                    否
                                </ToggleChip>
                            </div>
                        </FormField>
                    </div>
                ) : null}
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        取消
                    </Button>
                    <Button onClick={onSubmit} disabled={submitting}>
                        {submitting ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" data-icon="inline-start" />
                        ) : (
                            <ChevronRight data-icon="inline-start" />
                        )}
                        保存
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ToggleChip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => {
    return (
        <button
            type="button"
            className={cn(
                'inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm transition',
                active ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

function flattenMenuIds(nodes: MenuNode[]): string[] {
    return nodes.flatMap((node) => [node.id, ...flattenMenuIds(node.children ?? [])]);
}

function flattenMenuOptions(nodes: MenuNode[], depth = 1): Array<{ id: string; name: string; depth: number }> {
    return nodes.flatMap((node) => [{ id: node.id, name: node.name, depth }, ...flattenMenuOptions(node.children ?? [], depth + 1)]);
}
