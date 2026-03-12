import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, LoaderCircle, Pencil, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import {
    createRole,
    deleteRoles,
    fetchMenuTree,
    fetchRoleDetails,
    fetchRolePage,
    fetchRolePermissionIds,
    updateRole,
    updateRolePermissions,
} from './service';
import type { MenuTreeNode, RoleItem } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type RoleFormState = {
    roleId: string;
    roleName: string;
    roleCode: string;
    roleDesc: string;
};

const emptyForm: RoleFormState = {
    roleId: '',
    roleName: '',
    roleCode: '',
    roleDesc: '',
};

export const AdminRolePage = () => {
    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [query, setQuery] = useState('');
    const [draftQuery, setDraftQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [form, setForm] = useState<RoleFormState>(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [permissionOpen, setPermissionOpen] = useState(false);
    const [permissionRole, setPermissionRole] = useState<RoleItem | null>(null);
    const [menuTree, setMenuTree] = useState<MenuTreeNode[]>([]);
    const [checkedMenuIds, setCheckedMenuIds] = useState<string[]>([]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    useEffect(() => {
        void loadRoles(1, '');
    }, []);

    async function loadRoles(nextPage = page, nextQuery = query) {
        try {
            setLoading(true);
            const response = await fetchRolePage({
                current: nextPage,
                size: pageSize,
                roleName: nextQuery || undefined,
            });
            setRoles(response.data.records ?? []);
            setTotal(response.data.total ?? 0);
            setPage(nextPage);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '角色列表加载失败。' });
        } finally {
            setLoading(false);
        }
    }

    function handleSearch() {
        setQuery(draftQuery);
        void loadRoles(1, draftQuery);
    }

    function handleReset() {
        setDraftQuery('');
        setQuery('');
        void loadRoles(1, '');
    }

    function openCreateDialog() {
        setForm(emptyForm);
        setErrors({});
        setDialogOpen(true);
    }

    async function openEditDialog(roleId: string) {
        try {
            setSubmitting(true);
            const response = await fetchRoleDetails(roleId);
            setForm({
                roleId: response.data.roleId,
                roleName: response.data.roleName ?? '',
                roleCode: response.data.roleCode ?? '',
                roleDesc: response.data.roleDesc ?? '',
            });
            setErrors({});
            setDialogOpen(true);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '角色详情加载失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    function validateForm(state: RoleFormState) {
        const nextErrors: Record<string, string> = {};
        if (state.roleName.trim().length < 3) nextErrors.roleName = '角色名称至少 3 位。';
        if (!state.roleId && state.roleCode.trim().length < 3) nextErrors.roleCode = '角色标识至少 3 位。';
        if (!state.roleId && !/^[A-Z_]+$/.test(state.roleCode.trim())) nextErrors.roleCode = '角色标识仅支持大写字母和下划线。';
        if (state.roleDesc.length > 128) nextErrors.roleDesc = '角色描述不能超过 128 字。';
        return nextErrors;
    }

    async function handleSubmit() {
        const nextErrors = validateForm(form);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        try {
            setSubmitting(true);
            if (form.roleId) {
                await updateRole(form);
                setFeedback({ type: 'success', message: '角色已更新。' });
            } else {
                await createRole(form);
                setFeedback({ type: 'success', message: '角色已创建。' });
            }
            setDialogOpen(false);
            await loadRoles(form.roleId ? page : 1, query);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '角色保存失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(ids: string[]) {
        if (!ids.length) return;
        if (!window.confirm(`确认删除这 ${ids.length} 个角色吗？`)) return;

        try {
            setSubmitting(true);
            await deleteRoles(ids);
            setSelectedIds([]);
            setFeedback({ type: 'success', message: '角色已删除。' });
            await loadRoles(page, query);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '角色删除失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    async function openPermissionDialog(role: RoleItem) {
        try {
            setSubmitting(true);
            const [menuRes, selectedRes] = await Promise.all([fetchMenuTree(), fetchRolePermissionIds(role.roleId)]);
            setPermissionRole(role);
            setMenuTree(menuRes.data ?? []);
            setCheckedMenuIds(selectedRes.data ?? []);
            setPermissionOpen(true);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '权限数据加载失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    async function savePermissions() {
        if (!permissionRole) return;
        try {
            setSubmitting(true);
            await updateRolePermissions(permissionRole.roleId, checkedMenuIds);
            setPermissionOpen(false);
            setFeedback({ type: 'success', message: `角色 ${permissionRole.roleName} 的权限已更新。` });
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '权限更新失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    const selectedRoleCount = useMemo(() => selectedIds.length, [selectedIds]);

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">角色管理</CardTitle>
                        <CardDescription>包含角色列表、搜索、增删改和权限分配。</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={() => void loadRoles(page, query)} disabled={loading}>
                            刷新
                        </Button>
                        <Button onClick={openCreateDialog}>
                            <Plus data-icon="inline-start" />
                            新增角色
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
                                placeholder="按角色名称搜索"
                            />
                        </div>
                        <Button variant="outline" onClick={handleReset}>
                            重置
                        </Button>
                        <Button onClick={handleSearch}>查询</Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">总数 {total}</Badge>
                            {selectedRoleCount ? <Badge>{`已选 ${selectedRoleCount} 项`}</Badge> : null}
                        </div>
                        <Button variant="outline" disabled={!selectedRoleCount || submitting} onClick={() => void handleDelete(selectedIds)}>
                            <Trash2 data-icon="inline-start" />
                            批量删除
                        </Button>
                    </div>

                    <div className="overflow-hidden rounded-[28px] border border-border/70">
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-card/70 text-sm">
                                <thead className="bg-secondary/70 text-left text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    roles.length > 0 && selectedIds.length === roles.filter((role) => role.roleId !== '1').length
                                                }
                                                onChange={(event) =>
                                                    setSelectedIds(
                                                        event.target.checked
                                                            ? roles.filter((role) => role.roleId !== '1').map((role) => role.roleId)
                                                            : []
                                                    )
                                                }
                                            />
                                        </th>
                                        <th className="px-4 py-3">角色名称</th>
                                        <th className="px-4 py-3">角色标识</th>
                                        <th className="px-4 py-3">角色描述</th>
                                        <th className="px-4 py-3">创建时间</th>
                                        <th className="px-4 py-3 text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                                                <span className="inline-flex items-center gap-2">
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    加载中
                                                </span>
                                            </td>
                                        </tr>
                                    ) : roles.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                                                没有符合条件的角色。
                                            </td>
                                        </tr>
                                    ) : (
                                        roles.map((role) => {
                                            const fixedRole = role.roleId === '1';
                                            return (
                                                <tr key={role.roleId} className="border-t border-border/60 bg-background/70">
                                                    <td className="px-4 py-4 align-top">
                                                        <input
                                                            type="checkbox"
                                                            disabled={fixedRole}
                                                            checked={selectedIds.includes(role.roleId)}
                                                            onChange={(event) =>
                                                                setSelectedIds((prev) =>
                                                                    event.target.checked
                                                                        ? [...prev, role.roleId]
                                                                        : prev.filter((item) => item !== role.roleId)
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4 align-top font-medium">{role.roleName}</td>
                                                    <td className="px-4 py-4 align-top">{role.roleCode}</td>
                                                    <td className="px-4 py-4 align-top text-muted-foreground">{role.roleDesc || '-'}</td>
                                                    <td className="px-4 py-4 align-top text-muted-foreground">{role.createTime || '-'}</td>
                                                    <td className="px-4 py-4 align-top">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="sm" onClick={() => void openEditDialog(role.roleId)}>
                                                                <Pencil data-icon="inline-start" />
                                                                编辑
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => void openPermissionDialog(role)}>
                                                                <ShieldCheck data-icon="inline-start" />
                                                                授权
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                disabled={fixedRole}
                                                                onClick={() => void handleDelete([role.roleId])}
                                                            >
                                                                <Trash2 data-icon="inline-start" />
                                                                删除
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">{`第 ${page} / ${totalPages} 页`}</p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => void loadRoles(page - 1, query)} disabled={page <= 1 || loading}>
                                上一页
                            </Button>
                            <Button variant="outline" onClick={() => void loadRoles(page + 1, query)} disabled={page >= totalPages || loading}>
                                下一页
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <RoleDialog
                open={dialogOpen}
                form={form}
                errors={errors}
                submitting={submitting}
                onOpenChange={setDialogOpen}
                onChange={setForm}
                onSubmit={() => void handleSubmit()}
            />

            <Dialog open={permissionOpen} onOpenChange={setPermissionOpen}>
                <DialogContent className="max-w-5xl">
                    <DialogHeader>
                        <DialogTitle>权限分配</DialogTitle>
                        <DialogDescription>{permissionRole ? `为 ${permissionRole.roleName} 选择菜单权限。` : '选择菜单权限。'}</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={() => setCheckedMenuIds(flattenMenuIds(menuTree))}>
                            全选
                        </Button>
                        <Button variant="outline" onClick={() => setCheckedMenuIds([])}>
                            清空
                        </Button>
                    </div>
                    <div className="max-h-[60vh] overflow-auto rounded-[28px] border border-border/70 p-4">
                        <div className="flex flex-col gap-1">
                            {menuTree.map((node) => (
                                <PermissionNode key={node.id} node={node} checkedIds={checkedMenuIds} onToggle={setCheckedMenuIds} />
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPermissionOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={() => void savePermissions()} disabled={submitting}>
                            {submitting ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" data-icon="inline-start" />
                            ) : (
                                <ShieldCheck data-icon="inline-start" />
                            )}
                            更新权限
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const RoleDialog = ({
    open,
    form,
    errors,
    submitting,
    onOpenChange,
    onChange,
    onSubmit,
}: {
    open: boolean;
    form: RoleFormState;
    errors: Record<string, string>;
    submitting: boolean;
    onOpenChange: (open: boolean) => void;
    onChange: (form: RoleFormState) => void;
    onSubmit: () => void;
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{form.roleId ? '编辑角色' : '新增角色'}</DialogTitle>
                    <DialogDescription>字段结构和原表单一致，保留角色名称、标识和描述。</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <FormField label="角色名称" error={errors.roleName}>
                        <Input value={form.roleName} onChange={(event) => onChange({ ...form, roleName: event.target.value })} />
                    </FormField>
                    <FormField label="角色标识" error={errors.roleCode}>
                        <Input
                            value={form.roleCode}
                            disabled={Boolean(form.roleId)}
                            onChange={(event) => onChange({ ...form, roleCode: event.target.value.toUpperCase() })}
                        />
                    </FormField>
                    <FormField label="角色描述" error={errors.roleDesc}>
                        <textarea
                            className="min-h-32 rounded-[24px] border border-border/70 bg-background px-4 py-3 text-sm outline-none ring-ring transition focus-visible:ring-2"
                            maxLength={128}
                            value={form.roleDesc}
                            onChange={(event) => onChange({ ...form, roleDesc: event.target.value })}
                        />
                    </FormField>
                </div>
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

const PermissionNode = ({
    node,
    checkedIds,
    onToggle,
    depth = 0,
}: {
    node: MenuTreeNode;
    checkedIds: string[];
    onToggle: (values: string[]) => void;
    depth?: number;
}) => {
    const [expanded, setExpanded] = useState(true);
    const childrenIds = flattenMenuIds(node.children ?? []);
    const isChecked = checkedIds.includes(node.id);
    const hasChildren = Boolean(node.children?.length);

    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-accent" style={{ paddingLeft: `${12 + depth * 18}px` }}>
                <button type="button" className="text-muted-foreground" onClick={() => setExpanded((value) => !value)}>
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
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(event) => {
                        if (event.target.checked) {
                            onToggle(Array.from(new Set([...checkedIds, node.id, ...childrenIds])));
                        } else {
                            onToggle(checkedIds.filter((id) => id !== node.id && !childrenIds.includes(id)));
                        }
                    }}
                />
                <span className="text-sm">{node.name}</span>
            </div>
            {expanded &&
                node.children?.map((child) => (
                    <PermissionNode key={child.id} node={child} checkedIds={checkedIds} onToggle={onToggle} depth={depth + 1} />
                ))}
        </div>
    );
};

function flattenMenuIds(nodes: MenuTreeNode[]): string[] {
    return nodes.flatMap((node) => [node.id, ...flattenMenuIds(node.children ?? [])]);
}
