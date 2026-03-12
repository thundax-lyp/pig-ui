import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import type { DictOption } from '@/pages/sys/dict/types';
import { fetchDictOptions } from '@/pages/sys/dict/service';
import { createParam, deleteParams, fetchParamDetail, fetchParamPage, refreshParamCache, updateParam } from './service';
import type { ParamDetail, ParamItem } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ParamFormDialog } from './components/update-dialog';
import { cn } from '@/lib/utils';

type ParamFormState = ParamDetail;

const emptyForm: ParamFormState = {
    publicId: '',
    publicName: '',
    publicKey: '',
    publicValue: '',
    status: '0',
    systemFlag: '0',
    publicType: '0',
    validateCode: '',
};

export const AdminParamPage = () => {
    const [params, setParams] = useState<ParamItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [draftQuery, setDraftQuery] = useState({ publicName: '', publicKey: '', systemFlag: '' });
    const [query, setQuery] = useState({ publicName: '', publicKey: '', systemFlag: '' });
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<ParamFormState>(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [dictTypeOptions, setDictTypeOptions] = useState<DictOption[]>([]);
    const [statusOptions, setStatusOptions] = useState<DictOption[]>([]);
    const [paramTypeOptions, setParamTypeOptions] = useState<DictOption[]>([]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const dictTypeMap = useMemo(() => new Map(dictTypeOptions.map((item) => [item.value, item.label])), [dictTypeOptions]);
    const statusMap = useMemo(() => new Map(statusOptions.map((item) => [item.value, item.label])), [statusOptions]);
    const paramTypeMap = useMemo(() => new Map(paramTypeOptions.map((item) => [item.value, item.label])), [paramTypeOptions]);

    useEffect(() => {
        void Promise.all([loadParams(1, query), loadDictionaries()]);
    }, []);

    async function loadDictionaries() {
        try {
            const [dictTypeRes, statusRes, paramTypeRes] = await Promise.all([
                fetchDictOptions('dict_type'),
                fetchDictOptions('status_type'),
                fetchDictOptions('param_type'),
            ]);
            setDictTypeOptions(dictTypeRes.data ?? []);
            setStatusOptions(statusRes.data ?? []);
            setParamTypeOptions(paramTypeRes.data ?? []);
        } catch {
            setDictTypeOptions([
                { label: '可维护', value: '0' },
                { label: '系统内置', value: '1' },
            ]);
            setStatusOptions([
                { label: '启用', value: '0' },
                { label: '禁用', value: '1' },
            ]);
            setParamTypeOptions([
                { label: '默认', value: '0' },
                { label: '安全', value: '1' },
            ]);
        }
    }

    async function loadParams(nextPage = page, nextQuery = query) {
        try {
            setLoading(true);
            const response = await fetchParamPage({
                current: nextPage,
                size: pageSize,
                publicName: nextQuery.publicName || undefined,
                publicKey: nextQuery.publicKey || undefined,
                systemFlag: nextQuery.systemFlag || undefined,
            });
            setParams(response.data.records ?? []);
            setTotal(response.data.total ?? 0);
            setPage(nextPage);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '参数列表加载失败。' });
        } finally {
            setLoading(false);
        }
    }

    function handleSearch() {
        setQuery(draftQuery);
        void loadParams(1, draftQuery);
    }

    function handleReset() {
        const next = { publicName: '', publicKey: '', systemFlag: '' };
        setDraftQuery(next);
        setQuery(next);
        void loadParams(1, next);
    }

    function openCreateDialog() {
        setForm(emptyForm);
        setErrors({});
        setDialogOpen(true);
    }

    async function openEditDialog(id: string) {
        try {
            setSubmitting(true);
            const response = await fetchParamDetail(id);
            setForm({
                publicId: response.data.publicId,
                publicName: response.data.publicName ?? '',
                publicKey: response.data.publicKey ?? '',
                publicValue: response.data.publicValue ?? '',
                status: response.data.status ?? '0',
                systemFlag: response.data.systemFlag ?? '0',
                publicType: response.data.publicType ?? '0',
                validateCode: response.data.validateCode ?? '',
                createTime: response.data.createTime,
            });
            setErrors({});
            setDialogOpen(true);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '参数详情加载失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    function validateForm(state: ParamFormState) {
        const nextErrors: Record<string, string> = {};
        if (!state.publicName.trim()) nextErrors.publicName = '参数名称不能为空。';
        if (!state.publicKey.trim()) nextErrors.publicKey = '参数键不能为空。';
        if (!/^[A-Z0-9_]+$/.test(state.publicKey.trim())) nextErrors.publicKey = '参数键仅支持大写字母、数字和下划线。';
        if (!state.publicValue.trim()) nextErrors.publicValue = '参数值不能为空。';
        if (!state.status) nextErrors.status = '请选择状态。';
        if (!state.publicType) nextErrors.publicType = '请选择类型。';
        if (!state.systemFlag) nextErrors.systemFlag = '请选择系统标识。';
        return nextErrors;
    }

    async function handleSubmit() {
        const nextErrors = validateForm(form);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        try {
            setSubmitting(true);
            if (form.publicId) {
                await updateParam(form);
                setFeedback({ type: 'success', message: '参数已更新。' });
            } else {
                await createParam(form);
                setFeedback({ type: 'success', message: '参数已创建。' });
            }
            setDialogOpen(false);
            await loadParams(form.publicId ? page : 1, query);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '参数保存失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(ids: string[]) {
        if (!ids.length) return;
        if (!window.confirm(`确认删除这 ${ids.length} 个参数吗？`)) return;
        try {
            setSubmitting(true);
            await deleteParams(ids);
            setSelectedIds([]);
            setFeedback({ type: 'success', message: '参数已删除。' });
            await loadParams(page, query);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '参数删除失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleRefreshCache() {
        try {
            setSubmitting(true);
            await refreshParamCache();
            setFeedback({ type: 'success', message: '参数缓存已刷新。' });
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '缓存刷新失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">参数管理</CardTitle>
                        <CardDescription>支持条件查询、缓存刷新、批量删除和参数编辑。</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={() => void handleRefreshCache()} disabled={submitting}>
                            <RefreshCw data-icon="inline-start" />
                            刷新缓存
                        </Button>
                        <Button onClick={openCreateDialog}>
                            <Plus data-icon="inline-start" />
                            新增参数
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
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px_auto_auto]">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-10"
                                value={draftQuery.publicName}
                                onChange={(event) => setDraftQuery((prev) => ({ ...prev, publicName: event.target.value }))}
                                placeholder="按参数名称搜索"
                            />
                        </div>
                        <Input
                            value={draftQuery.publicKey}
                            onChange={(event) => setDraftQuery((prev) => ({ ...prev, publicKey: event.target.value }))}
                            placeholder="按参数键搜索"
                        />
                        <select
                            className="h-12 rounded-2xl border border-border/70 bg-background px-4 text-sm"
                            value={draftQuery.systemFlag}
                            onChange={(event) => setDraftQuery((prev) => ({ ...prev, systemFlag: event.target.value }))}
                        >
                            <option value="">全部系统标识</option>
                            {dictTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
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
                                                checked={
                                                    params.length > 0 &&
                                                    selectedIds.length === params.filter((item) => item.systemFlag !== '1').length
                                                }
                                                onChange={(event) =>
                                                    setSelectedIds(
                                                        event.target.checked
                                                            ? params.filter((item) => item.systemFlag !== '1').map((item) => item.publicId)
                                                            : []
                                                    )
                                                }
                                            />
                                        </th>
                                        <th className="px-4 py-3">参数名称</th>
                                        <th className="px-4 py-3">参数键</th>
                                        <th className="px-4 py-3">参数值</th>
                                        <th className="px-4 py-3">状态</th>
                                        <th className="px-4 py-3">创建时间</th>
                                        <th className="px-4 py-3">系统标识</th>
                                        <th className="px-4 py-3">参数类型</th>
                                        <th className="px-4 py-3 text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-16 text-center text-muted-foreground">
                                                <span className="inline-flex items-center gap-2">
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    加载中
                                                </span>
                                            </td>
                                        </tr>
                                    ) : params.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-16 text-center text-muted-foreground">
                                                没有符合条件的参数。
                                            </td>
                                        </tr>
                                    ) : (
                                        params.map((item) => (
                                            <tr key={item.publicId} className="border-t border-border/60 bg-background/70">
                                                <td className="px-4 py-4 align-top">
                                                    <input
                                                        type="checkbox"
                                                        disabled={item.systemFlag === '1'}
                                                        checked={selectedIds.includes(item.publicId)}
                                                        onChange={(event) =>
                                                            setSelectedIds((prev) =>
                                                                event.target.checked
                                                                    ? [...prev, item.publicId]
                                                                    : prev.filter((id) => id !== item.publicId)
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-4 align-top font-medium">{item.publicName}</td>
                                                <td className="px-4 py-4 align-top">{item.publicKey}</td>
                                                <td className="px-4 py-4 align-top text-muted-foreground">{item.publicValue}</td>
                                                <td className="px-4 py-4 align-top">
                                                    <Badge variant="outline">{statusMap.get(item.status) ?? item.status}</Badge>
                                                </td>
                                                <td className="px-4 py-4 align-top text-muted-foreground">{item.createTime || '-'}</td>
                                                <td className="px-4 py-4 align-top">
                                                    <Badge variant="outline">{dictTypeMap.get(item.systemFlag) ?? item.systemFlag}</Badge>
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <Badge variant="outline">{paramTypeMap.get(item.publicType) ?? item.publicType}</Badge>
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => void openEditDialog(item.publicId)}>
                                                            <Pencil data-icon="inline-start" />
                                                            编辑
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={item.systemFlag === '1'}
                                                            onClick={() => void handleDelete([item.publicId])}
                                                        >
                                                            <Trash2 data-icon="inline-start" />
                                                            删除
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">{`第 ${page} / ${totalPages} 页`}</p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => void loadParams(page - 1, query)} disabled={page <= 1 || loading}>
                                上一页
                            </Button>
                            <Button variant="outline" onClick={() => void loadParams(page + 1, query)} disabled={page >= totalPages || loading}>
                                下一页
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ParamFormDialog
                open={dialogOpen}
                form={form}
                errors={errors}
                submitting={submitting}
                dictTypeOptions={dictTypeOptions}
                statusOptions={statusOptions}
                paramTypeOptions={paramTypeOptions}
                onOpenChange={setDialogOpen}
                onChange={(updater) => setForm(updater)}
                onSubmit={() => void handleSubmit()}
            />
        </div>
    );
};
