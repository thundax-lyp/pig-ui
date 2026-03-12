import { useEffect, useState } from 'react';
import { Download, LoaderCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import {
    createFieldType,
    deleteFieldTypes,
    exportFieldTypes,
    fetchFieldTypeDetail,
    fetchFieldTypeDetailByColumnType,
    fetchFieldTypePage,
    updateFieldType,
} from './service';
import type { FieldTypeFormState, FieldTypeItem } from './types';
import { UpdateDialog } from './components/update-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { downloadBlob } from '@/lib/download';
import { cn } from '@/lib/utils';

const emptyForm: FieldTypeFormState = {
    id: '',
    columnType: '',
    attrType: '',
    packageName: '',
};

export const GenFieldTypePage = () => {
    const [rows, setRows] = useState<FieldTypeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<FieldTypeFormState>(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    useEffect(() => {
        void loadRows(1, '');
    }, []);

    const loadRows = async (nextPage = page, nextQuery = query) => {
        try {
            setLoading(true);
            const response = await fetchFieldTypePage({ current: nextPage, size: pageSize, columnType: nextQuery || undefined });
            setRows(response.data.records ?? []);
            setTotal(response.data.total ?? 0);
            setPage(nextPage);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '字段类型列表加载失败。' });
        } finally {
            setLoading(false);
        }
    };

    const validate = (nextForm: FieldTypeFormState) => {
        const nextErrors: Record<string, string> = {};
        if (!nextForm.columnType.trim()) nextErrors.columnType = '字段类型不能为空。';
        if (!nextForm.attrType.trim()) nextErrors.attrType = '属性类型不能为空。';
        return nextErrors;
    };

    const openCreateDialog = () => {
        setForm(emptyForm);
        setErrors({});
        setDialogOpen(true);
    };

    const openEditDialog = async (id: string) => {
        try {
            setSubmitting(true);
            const response = await fetchFieldTypeDetail(id);
            setForm({
                id: response.data.id,
                columnType: response.data.columnType ?? '',
                attrType: response.data.attrType ?? '',
                packageName: response.data.packageName ?? '',
            });
            setErrors({});
            setDialogOpen(true);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '字段类型详情加载失败。' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (ids: string[]) => {
        if (!ids.length) return;
        if (!window.confirm(`确认删除这 ${ids.length} 个字段类型吗？`)) return;
        try {
            setSubmitting(true);
            await deleteFieldTypes(ids);
            setSelectedIds([]);
            setFeedback({ type: 'success', message: '字段类型已删除。' });
            await loadRows(page, query);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '字段类型删除失败。' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSave = async () => {
        const nextErrors = validate(form);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        try {
            setSubmitting(true);
            if (!form.id) {
                const duplicate = await fetchFieldTypeDetailByColumnType(form.columnType);
                if (duplicate.data) {
                    setErrors({ columnType: '字段类型已存在。' });
                    return;
                }
            }
            if (form.id) {
                await updateFieldType(form);
                setFeedback({ type: 'success', message: '字段类型已更新。' });
            } else {
                await createFieldType(form);
                setFeedback({ type: 'success', message: '字段类型已创建。' });
            }
            setDialogOpen(false);
            await loadRows(form.id ? page : 1, query);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '字段类型保存失败。' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleExport = async () => {
        try {
            const blob = await exportFieldTypes({ columnType: query || undefined });
            downloadBlob(blob, 'fieldtype.xlsx');
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '字段类型导出失败。' });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">字段类型</CardTitle>
                        <CardDescription>维护字段类型、属性类型和包名映射。</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={() => void handleExport()}>
                            <Download data-icon="inline-start" />
                            导出
                        </Button>
                        <Button variant="outline" disabled={!selectedIds.length || submitting} onClick={() => void handleDelete(selectedIds)}>
                            <Trash2 data-icon="inline-start" />
                            批量删除
                        </Button>
                        <Button onClick={openCreateDialog}>
                            <Plus data-icon="inline-start" />
                            新增字段类型
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
                                placeholder="按字段类型搜索"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearch('');
                                setQuery('');
                                void loadRows(1, '');
                            }}
                        >
                            重置
                        </Button>
                        <Button
                            onClick={() => {
                                setQuery(search);
                                void loadRows(1, search);
                            }}
                        >
                            查询
                        </Button>
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
                                        <th className="px-4 py-3">字段类型</th>
                                        <th className="px-4 py-3">属性类型</th>
                                        <th className="px-4 py-3">包名</th>
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
                                    ) : rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                                                没有符合条件的字段类型。
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
                                                <td className="px-4 py-4 align-top font-medium">{row.columnType}</td>
                                                <td className="px-4 py-4 align-top">{row.attrType}</td>
                                                <td className="px-4 py-4 align-top">{row.packageName || '-'}</td>
                                                <td className="px-4 py-4 align-top text-muted-foreground">{row.createTime || '-'}</td>
                                                <td className="px-4 py-4 align-top">
                                                    <div className="flex justify-end gap-2">
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
                onChange={setForm}
                onSubmit={() => void handleSave()}
            />
        </div>
    );
};
