import { useEffect, useState } from 'react';
import { Download, LoaderCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { createGroup, deleteGroups, exportGroups, fetchGroupDetail, fetchGroupPage, fetchTemplateOptions, updateGroup } from './service';
import type { GroupFormState, GroupItem, TemplateOption } from './types';
import { UpdateDialog } from './components/update-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { downloadBlob } from '@/lib/download';
import { cn } from '@/lib/utils';

const emptyForm: GroupFormState = {
	id: '',
	groupName: '',
	groupDesc: '',
	templateId: [],
};

export const GenGroupPage = () => {
	const [rows, setRows] = useState<GroupItem[]>([]);
	const [templateOptions, setTemplateOptions] = useState<TemplateOption[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [search, setSearch] = useState('');
	const [query, setQuery] = useState('');
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [form, setForm] = useState<GroupFormState>(emptyForm);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	useEffect(() => {
		void Promise.all([loadRows(1, ''), loadTemplateOptions()]);
	}, []);

	const loadTemplateOptions = async () => {
		try {
			const response = await fetchTemplateOptions();
			setTemplateOptions(response.data ?? []);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '模板列表加载失败。' });
		}
	};

	const loadRows = async (nextPage = page, nextQuery = query) => {
		try {
			setLoading(true);
			const response = await fetchGroupPage({ current: nextPage, size: pageSize, groupName: nextQuery || undefined });
			setRows(response.data.records ?? []);
			setTotal(response.data.total ?? 0);
			setPage(nextPage);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '分组列表加载失败。' });
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (ids: string[]) => {
		if (!ids.length) return;
		if (!window.confirm(`确认删除这 ${ids.length} 个分组吗？`)) return;
		try {
			setSubmitting(true);
			await deleteGroups(ids);
			setSelectedIds([]);
			setFeedback({ type: 'success', message: '分组已删除。' });
			await loadRows(page, query);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '分组删除失败。' });
		} finally {
			setSubmitting(false);
		}
	};

	const validate = (nextForm: GroupFormState) => {
		const nextErrors: Record<string, string> = {};
		if (!nextForm.groupName.trim()) nextErrors.groupName = '分组名称不能为空。';
		if (!nextForm.templateId.length) nextErrors.templateId = '至少选择一个模板。';
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
			const response = await fetchGroupDetail(id);
			setForm({
				id: response.data.id,
				groupName: response.data.groupName ?? '',
				groupDesc: response.data.groupDesc ?? '',
				templateId: response.data.templateList?.map((item) => item.id) ?? [],
			});
			setErrors({});
			setDialogOpen(true);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '分组详情加载失败。' });
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
				await updateGroup(form);
				setFeedback({ type: 'success', message: '分组已更新。' });
			} else {
				await createGroup(form);
				setFeedback({ type: 'success', message: '分组已创建。' });
			}
			setDialogOpen(false);
			await loadRows(form.id ? page : 1, query);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '分组保存失败。' });
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
					<div>
						<CardTitle className="text-2xl">分组管理</CardTitle>
						<CardDescription>按生成风格和模板集合管理代码分组。</CardDescription>
					</div>
					<div className="flex flex-wrap gap-3">
						<Button variant="outline" onClick={async () => {
							try {
								const blob = await exportGroups({ groupName: query || undefined });
								downloadBlob(blob, 'group.xlsx');
							} catch (error: any) {
								setFeedback({ type: 'error', message: error?.msg ?? '分组导出失败。' });
							}
						}}>
							<Download data-icon="inline-start" />
							导出
						</Button>
						<Button variant="outline" disabled={!selectedIds.length || submitting} onClick={() => void handleDelete(selectedIds)}>
							<Trash2 data-icon="inline-start" />
							批量删除
						</Button>
						<Button onClick={openCreateDialog}>
							<Plus data-icon="inline-start" />
							新增分组
						</Button>
					</div>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{feedback ? <div className={cn('rounded-2xl border px-4 py-3 text-sm', feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700')}>{feedback.message}</div> : null}
					<div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
						<div className="relative">
							<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input className="pl-10" placeholder="按分组名称搜索" value={search} onChange={(event) => setSearch(event.target.value)} />
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
						{selectedIds.length ? <Badge>{`已选 ${selectedIds.length} 项`}</Badge> : null}
					</div>
					<div className="overflow-hidden rounded-[28px] border border-border/70">
						<div className="overflow-x-auto">
							<table className="min-w-full bg-card/70 text-sm">
								<thead className="bg-secondary/70 text-left text-muted-foreground">
									<tr>
										<th className="px-4 py-3"><input type="checkbox" checked={rows.length > 0 && selectedIds.length === rows.length} onChange={(event) => setSelectedIds(event.target.checked ? rows.map((item) => item.id) : [])} /></th>
										<th className="px-4 py-3">分组名称</th>
										<th className="px-4 py-3">描述</th>
										<th className="px-4 py-3">创建时间</th>
										<th className="px-4 py-3 text-right">操作</th>
									</tr>
								</thead>
								<tbody>
									{loading ? (
										<tr><td colSpan={5} className="px-4 py-16 text-center text-muted-foreground"><span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" />加载中</span></td></tr>
									) : rows.length === 0 ? (
										<tr><td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">没有符合条件的分组。</td></tr>
									) : rows.map((row) => (
										<tr key={row.id} className="border-t border-border/60 bg-background/70">
											<td className="px-4 py-4 align-top"><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={(event) => setSelectedIds((prev) => event.target.checked ? [...prev, row.id] : prev.filter((id) => id !== row.id))} /></td>
											<td className="px-4 py-4 align-top font-medium">{row.groupName}</td>
											<td className="px-4 py-4 align-top">{row.groupDesc || '-'}</td>
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

			<UpdateDialog open={dialogOpen} form={form} errors={errors} submitting={submitting} templateOptions={templateOptions} onOpenChange={setDialogOpen} onChange={(updater) => setForm((prev) => updater(prev))} onSubmit={() => void handleSave()} />
		</div>
	);
};
