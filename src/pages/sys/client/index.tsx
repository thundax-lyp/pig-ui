import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import type { DictOption } from '@/pages/sys/dict/types';
import { fetchDictOptions } from '@/pages/sys/dict/service';
import { createClient, deleteClients, fetchClientDetail, fetchClientPage, refreshClientCache, updateClient } from './service';
import type { ClientDetail, ClientItem } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ClientFormDialog } from './components/update-dialog';
import { cn } from '@/lib/utils';

type ClientFormState = {
    id: string;
    clientId: string;
    clientSecret: string;
    scope: string;
    authorizedGrantTypes: string[];
    webServerRedirectUri: string;
    authorities: string;
    accessTokenValidity: number;
    refreshTokenValidity: number;
    autoapprove: string;
    onlineQuantity: string;
    captchaFlag: string;
    encFlag: string;
};

const emptyForm: ClientFormState = {
    id: '',
    clientId: '',
    clientSecret: '',
    scope: 'server',
    authorizedGrantTypes: [],
    webServerRedirectUri: '',
    authorities: '',
    accessTokenValidity: 43200,
    refreshTokenValidity: 2592001,
    autoapprove: 'true',
    onlineQuantity: '1',
    captchaFlag: '1',
    encFlag: '1',
};

export const AdminClientPage = () => {
    const [clients, setClients] = useState<ClientItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [draftQuery, setDraftQuery] = useState({ clientId: '', clientSecret: '' });
    const [query, setQuery] = useState({ clientId: '', clientSecret: '' });
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<ClientFormState>(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [grantTypes, setGrantTypes] = useState<DictOption[]>([]);
    const [commonStatus, setCommonStatus] = useState<DictOption[]>([]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    useEffect(() => {
        void Promise.all([loadClients(1, query), loadDictionaries()]);
    }, []);

    async function loadDictionaries() {
        try {
            const [grantRes, statusRes] = await Promise.all([fetchDictOptions('grant_types'), fetchDictOptions('common_status')]);
            setGrantTypes(grantRes.data ?? []);
            setCommonStatus(statusRes.data ?? []);
        } catch {
            setGrantTypes([
                { label: '密码模式', value: 'password' },
                { label: '短信模式', value: 'mobile' },
                { label: '授权码模式', value: 'authorization_code' },
                { label: '客户端模式', value: 'client_credentials' },
                { label: '刷新令牌', value: 'refresh_token' },
            ]);
            setCommonStatus([
                { label: '是', value: 'true' },
                { label: '否', value: 'false' },
            ]);
        }
    }

    async function loadClients(nextPage = page, nextQuery = query) {
        try {
            setLoading(true);
            const response = await fetchClientPage({
                current: nextPage,
                size: pageSize,
                clientId: nextQuery.clientId || undefined,
                clientSecret: nextQuery.clientSecret || undefined,
            });
            setClients(response.data.records ?? []);
            setTotal(response.data.total ?? 0);
            setPage(nextPage);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '客户端列表加载失败。' });
        } finally {
            setLoading(false);
        }
    }

    function handleSearch() {
        setQuery(draftQuery);
        void loadClients(1, draftQuery);
    }

    function handleReset() {
        const next = { clientId: '', clientSecret: '' };
        setDraftQuery(next);
        setQuery(next);
        void loadClients(1, next);
    }

    function openCreateDialog() {
        setForm(emptyForm);
        setErrors({});
        setDialogOpen(true);
    }

    async function openEditDialog(id: string) {
        try {
            setSubmitting(true);
            const response = await fetchClientDetail(id);
            const detail: ClientDetail = response.data;
            setForm({
                id: detail.id,
                clientId: detail.clientId ?? '',
                clientSecret: detail.clientSecret ?? '',
                scope: detail.scope ?? 'server',
                authorizedGrantTypes: Array.isArray(detail.authorizedGrantTypes)
                    ? detail.authorizedGrantTypes
                    : String(detail.authorizedGrantTypes || '')
                        .split(',')
                        .filter(Boolean),
                webServerRedirectUri: detail.webServerRedirectUri ?? '',
                authorities: detail.authorities ?? '',
                accessTokenValidity: detail.accessTokenValidity ?? 43200,
                refreshTokenValidity: detail.refreshTokenValidity ?? 2592001,
                autoapprove: detail.autoapprove ?? 'true',
                onlineQuantity: detail.onlineQuantity ?? '1',
                captchaFlag: detail.captchaFlag ?? '1',
                encFlag: detail.encFlag ?? '1',
            });
            setErrors({});
            setDialogOpen(true);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '客户端详情加载失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    function validateForm(state: ClientFormState) {
        const nextErrors: Record<string, string> = {};
        if (!state.clientId.trim()) nextErrors.clientId = '客户端编号不能为空。';
        if (!/^[a-z0-9-_]+$/.test(state.clientId.trim())) nextErrors.clientId = '客户端编号仅支持小写字母、数字、-、_。';
        if (!state.clientSecret.trim()) nextErrors.clientSecret = '客户端密钥不能为空。';
        if (!state.scope.trim()) nextErrors.scope = '作用域不能为空。';
        if (!state.authorizedGrantTypes.length) nextErrors.authorizedGrantTypes = '至少选择一个授权模式。';
        if (state.accessTokenValidity < 1) nextErrors.accessTokenValidity = '访问令牌时效必须大于 0。';
        if (state.refreshTokenValidity < 1) nextErrors.refreshTokenValidity = '刷新令牌时效必须大于 0。';
        if (state.authorizedGrantTypes.includes('authorization_code') && !state.webServerRedirectUri.trim())
            nextErrors.webServerRedirectUri = '授权码模式需要回调地址。';
        return nextErrors;
    }

    async function handleSubmit() {
        const nextErrors = validateForm(form);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        const payload = {
            ...form,
            authorizedGrantTypes: form.authorizedGrantTypes,
        };

        try {
            setSubmitting(true);
            if (form.id) {
                await updateClient(payload);
                setFeedback({ type: 'success', message: '客户端已更新。' });
            } else {
                await createClient(payload);
                setFeedback({ type: 'success', message: '客户端已创建。' });
            }
            setDialogOpen(false);
            await loadClients(form.id ? page : 1, query);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '客户端保存失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(ids: string[]) {
        if (!ids.length) return;
        if (!window.confirm(`确认删除这 ${ids.length} 个客户端吗？`)) return;
        try {
            setSubmitting(true);
            await deleteClients(ids);
            setSelectedIds([]);
            setFeedback({ type: 'success', message: '客户端已删除。' });
            await loadClients(page, query);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '客户端删除失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleRefreshCache() {
        try {
            setSubmitting(true);
            await refreshClientCache();
            setFeedback({ type: 'success', message: '客户端缓存已刷新。' });
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '缓存刷新失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    const grantLabelMap = useMemo(() => new Map(grantTypes.map((item) => [item.value, item.label])), [grantTypes]);

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">客户端管理</CardTitle>
                        <CardDescription>支持客户端查询、缓存刷新、删除和授权配置。</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={() => void handleRefreshCache()} disabled={submitting}>
                            <RefreshCw data-icon="inline-start" />
                            刷新缓存
                        </Button>
                        <Button onClick={openCreateDialog}>
                            <Plus data-icon="inline-start" />
                            新增客户端
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
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-10"
                                value={draftQuery.clientId}
                                onChange={(event) => setDraftQuery((prev) => ({ ...prev, clientId: event.target.value }))}
                                placeholder="按 clientId 搜索"
                            />
                        </div>
                        <Input
                            value={draftQuery.clientSecret}
                            onChange={(event) => setDraftQuery((prev) => ({ ...prev, clientSecret: event.target.value }))}
                            placeholder="按 clientSecret 搜索"
                        />
                        <Button variant="outline" onClick={handleReset}>
                            重置
                        </Button>
                        <Button onClick={handleSearch}>查询</Button>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">总数 {total}</Badge>
                            {selectedIds.length ? <Badge>{`已选 ${selectedIds.length} 项`}</Badge> : null}
                        </div>
                        <Button variant="outline" disabled={!selectedIds.length || submitting} onClick={() => void handleDelete(selectedIds)}>
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
                                                checked={clients.length > 0 && selectedIds.length === clients.length}
                                                onChange={(event) => setSelectedIds(event.target.checked ? clients.map((item) => item.id) : [])}
                                            />
                                        </th>
                                        <th className="px-4 py-3">clientId</th>
                                        <th className="px-4 py-3">clientSecret</th>
                                        <th className="px-4 py-3">scope</th>
                                        <th className="px-4 py-3">授权模式</th>
                                        <th className="px-4 py-3">访问令牌</th>
                                        <th className="px-4 py-3">刷新令牌</th>
                                        <th className="px-4 py-3 text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                                                <span className="inline-flex items-center gap-2">
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    加载中
                                                </span>
                                            </td>
                                        </tr>
                                    ) : clients.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                                                没有符合条件的客户端。
                                            </td>
                                        </tr>
                                    ) : (
                                        clients.map((item) => {
                                            const grants = Array.isArray(item.authorizedGrantTypes)
                                                ? item.authorizedGrantTypes
                                                : String(item.authorizedGrantTypes || '')
                                                    .split(',')
                                                    .filter(Boolean);
                                            return (
                                                <tr key={item.id} className="border-t border-border/60 bg-background/70">
                                                    <td className="px-4 py-4 align-top">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(item.id)}
                                                            onChange={(event) =>
                                                                setSelectedIds((prev) =>
                                                                    event.target.checked ? [...prev, item.id] : prev.filter((id) => id !== item.id)
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4 align-top font-medium">{item.clientId}</td>
                                                    <td className="px-4 py-4 align-top text-muted-foreground">{item.clientSecret}</td>
                                                    <td className="px-4 py-4 align-top">{item.scope}</td>
                                                    <td className="px-4 py-4 align-top">
                                                        <div className="flex max-w-[360px] flex-wrap gap-2">
                                                            {grants.map((grant) => (
                                                                <Badge key={grant} variant="outline">
                                                                    {grantLabelMap.get(grant) ?? grant}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 align-top">{item.accessTokenValidity}</td>
                                                    <td className="px-4 py-4 align-top">{item.refreshTokenValidity}</td>
                                                    <td className="px-4 py-4 align-top">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="sm" onClick={() => void openEditDialog(item.id)}>
                                                                <Pencil data-icon="inline-start" />
                                                                编辑
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => void handleDelete([item.id])}>
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
                            <Button variant="outline" onClick={() => void loadClients(page - 1, query)} disabled={page <= 1 || loading}>
                                上一页
                            </Button>
                            <Button variant="outline" onClick={() => void loadClients(page + 1, query)} disabled={page >= totalPages || loading}>
                                下一页
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ClientFormDialog
                open={dialogOpen}
                form={form}
                errors={errors}
                submitting={submitting}
                grantTypes={grantTypes}
                commonStatus={commonStatus}
                onOpenChange={setDialogOpen}
                onChange={(updater) => setForm(updater)}
                onSubmit={() => void handleSubmit()}
            />
        </div>
    );
};
