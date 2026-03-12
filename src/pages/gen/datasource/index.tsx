import { useEffect, useState } from 'react';
import { Download, LoaderCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { createDatasource, deleteDatasources, downloadDatasourceDoc, fetchDatasourceDetail, fetchDatasourcePage, updateDatasource } from './service';
import type { DatasourceFormState, DatasourceItem } from './types';
import { UpdateDialog } from './components/update-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { downloadBlob } from '@/lib/download';
import { cn } from '@/lib/utils';

const emptyForm: DatasourceFormState = {
    id: '',
    name: '',
    url: '',
    username: '',
    password: '',
    dsType: 'mysql',
    confType: 0,
    dsName: '',
    instance: '',
    port: 3306,
    host: '',
};

export const GenDatasourcePage = () => {
    const [rows, setRows] = useState<DatasourceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<DatasourceFormState>(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    useEffect(() => {
        void loadRows(1, '');
    }, []);

    const loadRows = async (nextPage = page, nextQuery = query) => {
        try {
            setLoading(true);
            const response = await fetchDatasourcePage({
                current: nextPage,
                size: pageSize,
                dsName: nextQuery || undefined,
            });
            setRows(response.data.records ?? []);
            setTotal(response.data.total ?? 0);
            setPage(nextPage);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '数据源列表加载失败。' });
        } finally {
            setLoading(false);
        }
    };

    const validate = (nextForm: DatasourceFormState) => {
        const nextErrors: Record<string, string> = {};
        if (!nextForm.name.trim()) nextErrors.name = '别名不能为空。';
        if (!nextForm.username.trim()) nextErrors.username = '用户名不能为空。';
        if (!nextForm.password.trim() && !nextForm.id) nextErrors.password = '密码不能为空。';
        if (nextForm.confType === 1) {
            if (!nextForm.url.trim()) nextErrors.url = 'JDBC URL 不能为空。';
        } else {
            if (!nextForm.host.trim()) nextErrors.host = '主机不能为空。';
            if (!nextForm.dsName.trim()) nextErrors.dsName = '数据库名不能为空。';
            if (!nextForm.port) nextErrors.port = '端口不能为空。';
            if (nextForm.dsType === 'mssql' && !nextForm.instance.trim()) nextErrors.instance = '实例名不能为空。';
        }
        return nextErrors;
    };

    const handleSearch = () => {
        setQuery(search);
        void loadRows(1, search);
    };

    const handleReset = () => {
        setSearch('');
        setQuery('');
        void loadRows(1, '');
    };

    const openCreateDialog = () => {
        setForm(emptyForm);
        setErrors({});
        setDialogOpen(true);
    };

    const openEditDialog = async (id: string) => {
        try {
            setSubmitting(true);
            const response = await fetchDatasourceDetail(id);
            setForm({
                id: response.data.id,
                name: response.data.name ?? '',
                url: response.data.url ?? '',
                username: response.data.username ?? '',
                password: '********',
                dsType: response.data.dsType ?? 'mysql',
                confType: Number(response.data.confType ?? 0),
                dsName: response.data.dsName ?? '',
                instance: response.data.instance ?? '',
                port: Number(response.data.port ?? 3306),
                host: response.data.host ?? '',
            });
            setErrors({});
            setDialogOpen(true);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '数据源详情加载失败。' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (ids: string[]) => {
        if (!ids.length) return;
        if (!window.confirm(`确认删除这 ${ids.length} 个数据源吗？`)) return;
        try {
            setSubmitting(true);
            await deleteDatasources(ids);
            setSelectedIds([]);
            setFeedback({ type: 'success', message: '数据源已删除。' });
            await loadRows(page, query);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '数据源删除失败。' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownloadDoc = async (row: DatasourceItem) => {
        try {
            const blob = await downloadDatasourceDoc(row.name);
            downloadBlob(blob, `${row.name}.html`);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '数据源文档下载失败。' });
        }
    };

    const handleSave = async () => {
        const nextErrors = validate(form);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        try {
            setSubmitting(true);
            const payload = {
                ...form,
                password: form.password.includes('*') ? undefined : form.password,
            };
            if (form.id) {
                await updateDatasource(payload);
                setFeedback({ type: 'success', message: '数据源已更新。' });
            } else {
                await createDatasource(payload);
                setFeedback({ type: 'success', message: '数据源已创建。' });
            }
            setDialogOpen(false);
            await loadRows(form.id ? page : 1, query);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '数据源保存失败。' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">数据源</CardTitle>
                        <CardDescription>管理生成器使用的数据源连接和数据库文档。</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" disabled={!selectedIds.length || submitting} onClick={() => void handleDelete(selectedIds)}>
                            <Trash2 data-icon="inline-start" />
                            批量删除
                        </Button>
                        <Button onClick={openCreateDialog}>
                            <Plus data-icon="inline-start" />
                            新增数据源
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
                                placeholder="按数据源名搜索"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>
                        <Button variant="outline" onClick={handleReset}>
                            重置
                        </Button>
                        <Button onClick={handleSearch}>查询</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">总数 {total}</Badge>
                        {selectedIds.length ? <Badge>{`已选 ${selectedIds.length} 项`}</Badge> : null}
                    </div>
                    <div className="overflow-hidden rounded-[28px] border border-border/70">
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-card/70 text-sm">
                                <thead className="bg-secondary/70 text-left text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={rows.length > 0 && selectedIds.length === rows.length}
                                                onChange={(event) => setSelectedIds(event.target.checked ? rows.map((item) => item.id) : [])}
                                            />
                                        </th>
                                        <th className="px-4 py-3">别名</th>
                                        <th className="px-4 py-3">数据库名</th>
                                        <th className="px-4 py-3">类型</th>
                                        <th className="px-4 py-3">用户名</th>
                                        <th className="px-4 py-3">创建时间</th>
                                        <th className="px-4 py-3 text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                                                <span className="inline-flex items-center gap-2">
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    加载中
                                                </span>
                                            </td>
                                        </tr>
                                    ) : rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                                                没有符合条件的数据源。
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((row) => (
                                            <tr key={row.id} className="border-t border-border/60 bg-background/70">
                                                <td className="px-4 py-4 align-top">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(row.id)}
                                                        onChange={(event) =>
                                                            setSelectedIds((prev) =>
                                                                event.target.checked ? [...prev, row.id] : prev.filter((id) => id !== row.id)
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-4 align-top font-medium">{row.name}</td>
                                                <td className="px-4 py-4 align-top">{row.dsName}</td>
                                                <td className="px-4 py-4 align-top">
                                                    <Badge variant="secondary">{row.dsType}</Badge>
                                                </td>
                                                <td className="px-4 py-4 align-top">{row.username}</td>
                                                <td className="px-4 py-4 align-top text-muted-foreground">{row.createTime ?? '-'}</td>
                                                <td className="px-4 py-4 align-top">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="ghost" onClick={() => void handleDownloadDoc(row)}>
                                                            <Download data-icon="inline-start" />
                                                            文档
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => void openEditDialog(row.id)}>
                                                            <Pencil data-icon="inline-start" />
                                                            编辑
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => void handleDelete([row.id])}>
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
                            <Button variant="outline" onClick={() => void loadRows(page - 1, query)} disabled={page <= 1 || loading}>
                                上一页
                            </Button>
                            <Button variant="outline" onClick={() => void loadRows(page + 1, query)} disabled={page >= totalPages || loading}>
                                下一页
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <UpdateDialog
                open={dialogOpen}
                form={form}
                errors={errors}
                submitting={submitting}
                onOpenChange={setDialogOpen}
                onChange={(updater) => setForm((prev) => updater(prev))}
                onSubmit={() => void handleSave()}
            />
        </div>
    );
};
