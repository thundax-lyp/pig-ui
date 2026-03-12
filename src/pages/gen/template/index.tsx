import { useEffect, useState } from 'react';
import { Download, LoaderCircle, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { checkTemplateVersion, createTemplate, deleteTemplates, exportTemplates, fetchTemplateDetail, fetchTemplatePage, updateTemplate, updateTemplatesOnline } from './service';
import type { TemplateFormState, TemplateItem } from './types';
import { UpdateDialog } from './components/update-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { downloadBlob } from '@/lib/download';
import { cn } from '@/lib/utils';

const emptyForm: TemplateFormState = {
	id: '',
	templateName: '',
	generatorPath: '',
	templateDesc: '',
	templateCode: '',
};

export const GenTemplatePage = () => {
	const [rows, setRows] = useState<TemplateItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [updatingOnline, setUpdatingOnline] = useState(false);
	const [search, setSearch] = useState('');
	const [query, setQuery] = useState('');
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [form, setForm] = useState<TemplateFormState>(emptyForm);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
	const [hasUpdate, setHasUpdate] = useState(false);

	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	useEffect(() => {
		void Promise.all([loadRows(1, ''), loadVersion()]);
	}, []);

	const loadVersion = async () => {
		try {
			const response = await checkTemplateVersion();
			setHasUpdate(response.data === false);
		} catch {
			setHasUpdate(false);
		}
	};

	const loadRows = async (nextPage = page, nextQuery = query) => {
		try {
			setLoading(true);
			const response = await fetchTemplatePage({ current: nextPage, size: pageSize, templateName: nextQuery || undefined });
			setRows(response.data.records ?? []);
			setTotal(response.data.total ?? 0);
			setPage(nextPage);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '模板列表加载失败。' });
		} finally {
			setLoading(false);
		}
	};

	const validate = (nextForm: TemplateFormState) => {
		const nextErrors: Record<string, string> = {};
		if (!nextForm.templateName.trim()) nextErrors.templateName = '模板名称不能为空。';
		if (!nextForm.generatorPath.trim()) nextErrors.generatorPath = '模板路径不能为空。';
		if (!nextForm.templateDesc.trim()) nextErrors.templateDesc = '模板描述不能为空。';
		if (!nextForm.templateCode.trim()) nextErrors.templateCode = '模板代码不能为空。';
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
			const response = await fetchTemplateDetail(id);
			setForm({
				id: response.data.id,
				templateName: response.data.templateName ?? '',
				generatorPath: response.data.generatorPath ?? '',
				templateDesc: response.data.templateDesc ?? '',
				templateCode: response.data.templateCode ?? '',
			});
			setErrors({});
			setDialogOpen(true);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '模板详情加载失败。' });
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (ids: string[]) => {
		if (!ids.length) return;
		if (!window.confirm(`确认删除这 ${ids.length} 个模板吗？`)) return;
		try {
			setSubmitting(true);
			await deleteTemplates(ids);
			setSelectedIds([]);
			setFeedback({ type: 'success', message: '模板已删除。' });
			await loadRows(page, query);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '模板删除失败。' });
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
			if (form.id) {
				await updateTemplate(form);
				setFeedback({ type: 'success', message: '模板已更新。' });
			} else {
				await createTemplate(form);
				setFeedback({ type: 'success', message: '模板已创建。' });
			}
			setDialogOpen(false);
			await loadRows(form.id ? page : 1, query);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '模板保存失败。' });
		} finally {
			setSubmitting(false);
		}
	};

	const handleOnlineUpdate = async () => {
		try {
			setUpdatingOnline(true);
			const response = await updateTemplatesOnline();
			setFeedback({ type: 'success', message: response.data || '模板已更新。' });
			setHasUpdate(false);
			await loadRows(1, query);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '模板在线更新失败。' });
		} finally {
			setUpdatingOnline(false);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
					<div>
						<CardTitle className="text-2xl">模板管理</CardTitle>
						<CardDescription>维护生成模板、输出路径和模板源码。</CardDescription>
					</div>
					<div className="flex flex-wrap gap-3">
						<Button variant="outline" onClick={async () => {
							try {
								const blob = await exportTemplates({ templateName: query || undefined });
								downloadBlob(blob, 'template.xlsx');
							} catch (error: any) {
								setFeedback({ type: 'error', message: error?.msg ?? '模板导出失败。' });
							}
						}}>
							<Download data-icon="inline-start" />
							导出
						</Button>
						<Button variant="outline" onClick={() => void handleOnlineUpdate()} disabled={updatingOnline || !hasUpdate}>
							<RefreshCw className={cn(updatingOnline && 'animate-spin')} data-icon="inline-start" />
							在线更新
						</Button>
						<Button variant="outline" disabled={!selectedIds.length || submitting} onClick={() => void handleDelete(selectedIds)}>
							<Trash2 data-icon="inline-start" />
							批量删除
						</Button>
						<Button onClick={openCreateDialog}>
							<Plus data-icon="inline-start" />
							新增模板
						</Button>
					</div>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{feedback ? <div className={cn('rounded-2xl border px-4 py-3 text-sm', feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700')}>{feedback.message}</div> : null}
					<div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
						<div className="relative">
							<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input className="pl-10" placeholder="按模板名称搜索" value={search} onChange={(event) => setSearch(event.target.value)} />
						</div>
						<Button variant="outline" onClick={() => {
							setSearch('');
							setQuery('');
							void loadRows(1, '');
						}}>重置</Button>
						<Button onClick={() => {
							setQuery(search);
							void loadRows(1, search);
						}}>查询</Button>
					</div>
					<div className="flex flex-wrap gap-2">
						<Badge variant="secondary">总数 {total}</Badge>
						{hasUpdate ? <Badge>发现新版本</Badge> : null}
						{selectedIds.length ? <Badge>{`已选 ${selectedIds.length} 项`}</Badge> : null}
					</div>
					<div className="overflow-hidden rounded-[28px] border border-border/70">
						<div className="overflow-x-auto">
							<table className="min-w-full bg-card/70 text-sm">
								<thead className="bg-secondary/70 text-left text-muted-foreground">
									<tr>
										<th className="px-4 py-3"><input type="checkbox" checked={rows.length > 0 && selectedIds.length === rows.length} onChange={(event) => setSelectedIds(event.target.checked ? rows.map((item) => item.id) : [])} /></th>
										<th className="px-4 py-3">模板名称</th>
										<th className="px-4 py-3">输出路径</th>
										<th className="px-4 py-3">描述</th>
										<th className="px-4 py-3">创建时间</th>
										<th className="px-4 py-3 text-right">操作</th>
									</tr>
								</thead>
								<tbody>
									{loading ? (
										<tr><td colSpan={6} className="px-4 py-16 text-center text-muted-foreground"><span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" />加载中</span></td></tr>
									) : rows.length === 0 ? (
										<tr><td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">没有符合条件的模板。</td></tr>
									) : rows.map((row) => (
										<tr key={row.id} className="border-t border-border/60 bg-background/70">
											<td className="px-4 py-4 align-top"><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={(event) => setSelectedIds((prev) => event.target.checked ? [...prev, row.id] : prev.filter((id) => id !== row.id))} /></td>
											<td className="px-4 py-4 align-top font-medium">{row.templateName}</td>
											<td className="px-4 py-4 align-top">{row.generatorPath}</td>
											<td className="px-4 py-4 align-top">{row.templateDesc}</td>
											<td className="px-4 py-4 align-top text-muted-foreground">{row.createTime || '-'}</td>
											<td className="px-4 py-4 align-top">
												<div className="flex justify-end gap-2">
													<Button size="sm" variant="ghost" onClick={() => void openEditDialog(row.id)}><Pencil data-icon="inline-start" />编辑</Button>
													<Button size="sm" variant="ghost" onClick={() => void handleDelete([row.id])}><Trash2 data-icon="inline-start" />删除</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<p className="text-sm text-muted-foreground">{`第 ${page} / ${totalPages} 页`}</p>
						<div className="flex gap-3">
							<Button variant="outline" onClick={() => void loadRows(page - 1, query)} disabled={page <= 1 || loading}>上一页</Button>
							<Button variant="outline" onClick={() => void loadRows(page + 1, query)} disabled={page >= totalPages || loading}>下一页</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<UpdateDialog open={dialogOpen} form={form} errors={errors} submitting={submitting} onOpenChange={setDialogOpen} onChange={setForm} onSubmit={() => void handleSave()} />
		</div>
	);
};
