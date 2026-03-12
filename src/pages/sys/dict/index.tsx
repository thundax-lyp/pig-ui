import { useEffect, useState } from 'react';
import { ChevronRight, LoaderCircle, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import type { DictItem, DictTypeItem } from './types';
import {
    createDictItem,
    createDictType,
    deleteDictItem,
    deleteDictTypes,
    fetchDictItemDetail,
    fetchDictItems,
    fetchDictTypeDetail,
    fetchDictTypes,
    refreshDictCache,
    updateDictItem,
    updateDictType,
} from './service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type DictTypeForm = {
    id: string;
    dictType: string;
    description: string;
    systemFlag: string;
    remarks: string;
};

type DictItemForm = {
    id: string;
    dictId: string;
    dictType: string;
    value: string;
    label: string;
    description: string;
    sortOrder: number;
    remarks: string;
};

const emptyDictTypeForm: DictTypeForm = {
    id: '',
    dictType: '',
    description: '',
    systemFlag: '0',
    remarks: '',
};

const emptyDictItemForm: DictItemForm = {
    id: '',
    dictId: '',
    dictType: '',
    value: '',
    label: '',
    description: '',
    sortOrder: 0,
    remarks: '',
};

export const AdminDictPage = () => {
    const [dictTypes, setDictTypes] = useState<DictTypeItem[]>([]);
    const [selectedType, setSelectedType] = useState<DictTypeItem | null>(null);
    const [dictItems, setDictItems] = useState<DictItem[]>([]);
    const [loadingTypes, setLoadingTypes] = useState(true);
    const [loadingItems, setLoadingItems] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [typeDialogOpen, setTypeDialogOpen] = useState(false);
    const [itemDialogOpen, setItemDialogOpen] = useState(false);
    const [typeForm, setTypeForm] = useState<DictTypeForm>(emptyDictTypeForm);
    const [itemForm, setItemForm] = useState<DictItemForm>(emptyDictItemForm);
    const [typeErrors, setTypeErrors] = useState<Record<string, string>>({});
    const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        void loadDictTypes();
    }, []);

    async function loadDictTypes(name = search) {
        try {
            setLoadingTypes(true);
            const response = await fetchDictTypes(name || undefined);
            const nextTypes = response.data ?? [];
            setDictTypes(nextTypes);
            if (nextTypes.length) {
                const nextSelected = selectedType ? (nextTypes.find((item) => item.id === selectedType.id) ?? nextTypes[0]) : nextTypes[0];
                setSelectedType(nextSelected);
                await loadDictItems(nextSelected, 1);
            } else {
                setSelectedType(null);
                setDictItems([]);
                setTotal(0);
            }
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '字典类型加载失败。' });
        } finally {
            setLoadingTypes(false);
        }
    }

    async function loadDictItems(type = selectedType, nextPage = page) {
        if (!type) return;
        try {
            setLoadingItems(true);
            const response = await fetchDictItems({
                dictId: type.id,
                dictType: type.dictType,
                current: nextPage,
                size: pageSize,
            });
            setDictItems(response.data.records ?? []);
            setTotal(response.data.total ?? 0);
            setPage(nextPage);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '字典项加载失败。' });
        } finally {
            setLoadingItems(false);
        }
    }

    function openCreateTypeDialog() {
        setTypeForm(emptyDictTypeForm);
        setTypeErrors({});
        setTypeDialogOpen(true);
    }

    async function openEditTypeDialog(id: string) {
        try {
            setSubmitting(true);
            const response = await fetchDictTypeDetail(id);
            setTypeForm({
                id: response.data.id,
                dictType: response.data.dictType ?? '',
                description: response.data.description ?? '',
                systemFlag: response.data.systemFlag ?? '0',
                remarks: response.data.remarks ?? '',
            });
            setTypeErrors({});
            setTypeDialogOpen(true);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '字典类型详情加载失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteType(id: string) {
        if (!window.confirm('确认删除这个字典类型吗？')) return;
        try {
            setSubmitting(true);
            await deleteDictTypes([id]);
            setFeedback({ type: 'success', message: '字典类型已删除。' });
            await loadDictTypes();
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '字典类型删除失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    function validateTypeForm(form: DictTypeForm) {
        const errors: Record<string, string> = {};
        if (!form.dictType.trim()) errors.dictType = '字典类型不能为空。';
        if (!form.description.trim()) errors.description = '描述不能为空。';
        return errors;
    }

    async function saveType() {
        const errors = validateTypeForm(typeForm);
        setTypeErrors(errors);
        if (Object.keys(errors).length) return;
        try {
            setSubmitting(true);
            if (typeForm.id) {
                await updateDictType(typeForm);
                setFeedback({ type: 'success', message: '字典类型已更新。' });
            } else {
                await createDictType(typeForm);
                setFeedback({ type: 'success', message: '字典类型已创建。' });
            }
            setTypeDialogOpen(false);
            await loadDictTypes();
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '字典类型保存失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    function openCreateItemDialog() {
        if (!selectedType) return;
        setItemForm({
            ...emptyDictItemForm,
            dictId: selectedType.id,
            dictType: selectedType.dictType,
        });
        setItemErrors({});
        setItemDialogOpen(true);
    }

    async function openEditItemDialog(id: string) {
        try {
            setSubmitting(true);
            const response = await fetchDictItemDetail(id);
            setItemForm({
                id: response.data.id,
                dictId: response.data.dictId,
                dictType: response.data.dictType,
                value: response.data.value ?? '',
                label: response.data.label ?? '',
                description: response.data.description ?? '',
                sortOrder: response.data.sortOrder ?? 0,
                remarks: response.data.remarks ?? '',
            });
            setItemErrors({});
            setItemDialogOpen(true);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '字典项详情加载失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteItem(id: string) {
        if (!window.confirm('确认删除这个字典项吗？')) return;
        try {
            setSubmitting(true);
            await deleteDictItem(id);
            setFeedback({ type: 'success', message: '字典项已删除。' });
            await loadDictItems(selectedType, page);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '字典项删除失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    function validateItemForm(form: DictItemForm) {
        const errors: Record<string, string> = {};
        if (!form.label.trim()) errors.label = '标签不能为空。';
        if (!form.value.trim()) errors.value = '数据值不能为空。';
        if (!form.description.trim()) errors.description = '描述不能为空。';
        if (!Number.isFinite(form.sortOrder)) errors.sortOrder = '排序必须是数字。';
        return errors;
    }

    async function saveItem() {
        const errors = validateItemForm(itemForm);
        setItemErrors(errors);
        if (Object.keys(errors).length) return;
        try {
            setSubmitting(true);
            if (itemForm.id) {
                await updateDictItem(itemForm);
                setFeedback({ type: 'success', message: '字典项已更新。' });
            } else {
                await createDictItem(itemForm);
                setFeedback({ type: 'success', message: '字典项已创建。' });
            }
            setItemDialogOpen(false);
            await loadDictItems(selectedType, itemForm.id ? page : 1);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '字典项保存失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleRefreshCache() {
        try {
            setSubmitting(true);
            await refreshDictCache();
            setFeedback({ type: 'success', message: '字典缓存已刷新。' });
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.msg ?? '缓存刷新失败。' });
        } finally {
            setSubmitting(false);
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <Card className="min-h-[720px]">
                <CardHeader>
                    <CardTitle>字典类型</CardTitle>
                    <CardDescription>保留左侧字典类型列表和右侧字典项明细的主从布局。</CardDescription>
                </CardHeader>
                <CardContent className="flex h-[calc(100%-5rem)] flex-col gap-4">
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-10"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="搜索字典类型或名称"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button className="flex-1" onClick={() => void loadDictTypes(search)}>
                                查询
                            </Button>
                            <Button variant="outline" onClick={openCreateTypeDialog}>
                                <Plus />
                            </Button>
                            <Button variant="outline" onClick={() => void handleRefreshCache()}>
                                <RefreshCw />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto rounded-[28px] border border-border/70">
                        {loadingTypes ? (
                            <div className="px-4 py-16 text-center text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-2">
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                    加载中
                                </span>
                            </div>
                        ) : dictTypes.length === 0 ? (
                            <div className="px-4 py-16 text-center text-sm text-muted-foreground">没有符合条件的字典类型。</div>
                        ) : (
                            <div className="flex flex-col divide-y divide-border/60">
                                {dictTypes.map((item) => (
                                    <button
                                        key={item.id}
                                        className={cn(
                                            'flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition hover:bg-accent',
                                            selectedType?.id === item.id ? 'bg-foreground text-background hover:bg-foreground' : ''
                                        )}
                                        onClick={() => {
                                            setSelectedType(item);
                                            void loadDictItems(item, 1);
                                        }}
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">{item.description}</p>
                                            <p
                                                className={cn(
                                                    'mt-1 truncate text-xs',
                                                    selectedType?.id === item.id ? 'text-background/70' : 'text-muted-foreground'
                                                )}
                                            >
                                                {item.dictType}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    void openEditTypeDialog(item.id);
                                                }}
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={item.systemFlag !== '0'}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    void handleDeleteType(item.id);
                                                }}
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="min-h-[720px]">
                <CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
                    <div>
                        <CardTitle>{selectedType ? `${selectedType.description} 字典项` : '字典项'}</CardTitle>
                        <CardDescription>{selectedType ? `当前类型：${selectedType.dictType}` : '请先选择左侧字典类型。'}</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {selectedType ? <Badge variant="secondary">{selectedType.dictType}</Badge> : null}
                        <Button onClick={openCreateItemDialog} disabled={!selectedType}>
                            <Plus data-icon="inline-start" />
                            新增字典项
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
                    <div className="overflow-hidden rounded-[28px] border border-border/70">
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-card/70 text-sm">
                                <thead className="bg-secondary/70 text-left text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">类型</th>
                                        <th className="px-4 py-3">数据值</th>
                                        <th className="px-4 py-3">标签</th>
                                        <th className="px-4 py-3">描述</th>
                                        <th className="px-4 py-3">排序</th>
                                        <th className="px-4 py-3">备注</th>
                                        <th className="px-4 py-3">创建时间</th>
                                        <th className="px-4 py-3 text-right">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingItems ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                                                <span className="inline-flex items-center gap-2">
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    加载中
                                                </span>
                                            </td>
                                        </tr>
                                    ) : dictItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                                                {selectedType ? '当前字典类型还没有字典项。' : '请先选择左侧字典类型。'}
                                            </td>
                                        </tr>
                                    ) : (
                                        dictItems.map((item) => (
                                            <tr key={item.id} className="border-t border-border/60 bg-background/70">
                                                <td className="px-4 py-4 align-top">{item.dictType}</td>
                                                <td className="px-4 py-4 align-top font-medium">{item.value}</td>
                                                <td className="px-4 py-4 align-top">{item.label}</td>
                                                <td className="px-4 py-4 align-top">{item.description}</td>
                                                <td className="px-4 py-4 align-top">{item.sortOrder}</td>
                                                <td className="px-4 py-4 align-top text-muted-foreground">{item.remarks || '-'}</td>
                                                <td className="px-4 py-4 align-top text-muted-foreground">{item.createTime || '-'}</td>
                                                <td className="px-4 py-4 align-top">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => void openEditItemDialog(item.id)}>
                                                            <Pencil data-icon="inline-start" />
                                                            编辑
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => void handleDeleteItem(item.id)}>
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
                        <p className="text-sm text-muted-foreground">{`第 ${page} / ${Math.max(1, totalPages)} 页`}</p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => void loadDictItems(selectedType, page - 1)}
                                disabled={page <= 1 || loadingItems || !selectedType}
                            >
                                上一页
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => void loadDictItems(selectedType, page + 1)}
                                disabled={page >= totalPages || loadingItems || !selectedType}
                            >
                                下一页
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <DictTypeDialog
                open={typeDialogOpen}
                form={typeForm}
                errors={typeErrors}
                submitting={submitting}
                onOpenChange={setTypeDialogOpen}
                onChange={setTypeForm}
                onSubmit={() => void saveType()}
            />

            <DictItemDialog
                open={itemDialogOpen}
                form={itemForm}
                errors={itemErrors}
                submitting={submitting}
                onOpenChange={setItemDialogOpen}
                onChange={setItemForm}
                onSubmit={() => void saveItem()}
            />
        </div>
    );
};

const DictTypeDialog = ({
    open,
    form,
    errors,
    submitting,
    onOpenChange,
    onChange,
    onSubmit,
}: {
    open: boolean;
    form: DictTypeForm;
    errors: Record<string, string>;
    submitting: boolean;
    onOpenChange: (open: boolean) => void;
    onChange: (form: DictTypeForm) => void;
    onSubmit: () => void;
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{form.id ? '编辑字典类型' : '新增字典类型'}</DialogTitle>
                    <DialogDescription>编辑字典类型、描述、系统标识和备注。</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <FormField label="系统标识">
                        <div className="flex gap-3">
                            <ToggleChip active={form.systemFlag === '0'} onClick={() => onChange({ ...form, systemFlag: '0' })}>
                                可维护
                            </ToggleChip>
                            <ToggleChip active={form.systemFlag === '1'} onClick={() => onChange({ ...form, systemFlag: '1' })}>
                                系统内置
                            </ToggleChip>
                        </div>
                    </FormField>
                    <FormField label="字典类型" error={errors.dictType}>
                        <Input
                            value={form.dictType}
                            disabled={Boolean(form.id)}
                            onChange={(event) => onChange({ ...form, dictType: event.target.value })}
                        />
                    </FormField>
                    <FormField label="描述" error={errors.description}>
                        <Input value={form.description} onChange={(event) => onChange({ ...form, description: event.target.value })} />
                    </FormField>
                    <FormField label="备注">
                        <textarea
                            className="min-h-32 rounded-[24px] border border-border/70 bg-background px-4 py-3 text-sm outline-none ring-ring transition focus-visible:ring-2"
                            maxLength={150}
                            value={form.remarks}
                            onChange={(event) => onChange({ ...form, remarks: event.target.value })}
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

const DictItemDialog = ({
    open,
    form,
    errors,
    submitting,
    onOpenChange,
    onChange,
    onSubmit,
}: {
    open: boolean;
    form: DictItemForm;
    errors: Record<string, string>;
    submitting: boolean;
    onOpenChange: (open: boolean) => void;
    onChange: (form: DictItemForm) => void;
    onSubmit: () => void;
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{form.id ? '编辑字典项' : '新增字典项'}</DialogTitle>
                    <DialogDescription>当前字典类型：{form.dictType || '未选择'}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <FormField label="字典类型">
                        <Input value={form.dictType} disabled />
                    </FormField>
                    <FormField label="标签" error={errors.label}>
                        <Input value={form.label} onChange={(event) => onChange({ ...form, label: event.target.value })} />
                    </FormField>
                    <FormField label="数据值" error={errors.value}>
                        <Input value={form.value} onChange={(event) => onChange({ ...form, value: event.target.value })} />
                    </FormField>
                    <FormField label="描述" error={errors.description}>
                        <Input value={form.description} onChange={(event) => onChange({ ...form, description: event.target.value })} />
                    </FormField>
                    <FormField label="排序" error={errors.sortOrder}>
                        <Input
                            type="number"
                            value={String(form.sortOrder)}
                            onChange={(event) => onChange({ ...form, sortOrder: Number(event.target.value || 0) })}
                        />
                    </FormField>
                    <FormField label="备注">
                        <textarea
                            className="min-h-28 rounded-[24px] border border-border/70 bg-background px-4 py-3 text-sm outline-none ring-ring transition focus-visible:ring-2"
                            maxLength={150}
                            value={form.remarks}
                            onChange={(event) => onChange({ ...form, remarks: event.target.value })}
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
