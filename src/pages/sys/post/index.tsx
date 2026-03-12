import { useEffect, useState } from 'react';
import { ChevronRight, LoaderCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { createPost, deletePosts, fetchPostDetail, fetchPostPage, updatePost } from './service';
import type { PostDetail, PostItem } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type PostFormState = PostDetail;

const emptyForm: PostFormState = {
	postId: '',
	postCode: '',
	postName: '',
	postSort: 0,
	remark: '',
};

export const AdminPostPage = () => {
	const [posts, setPosts] = useState<PostItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [query, setQuery] = useState('');
	const [draftQuery, setDraftQuery] = useState('');
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [form, setForm] = useState<PostFormState>(emptyForm);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	useEffect(() => {
		void loadPosts(1, '');
	}, []);

	async function loadPosts(nextPage = page, nextQuery = query) {
		try {
			setLoading(true);
			const response = await fetchPostPage({
				current: nextPage,
				size: pageSize,
				postName: nextQuery || undefined,
			});
			setPosts(response.data.records ?? []);
			setTotal(response.data.total ?? 0);
			setPage(nextPage);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '岗位列表加载失败。' });
		} finally {
			setLoading(false);
		}
	}

	function handleSearch() {
		setQuery(draftQuery);
		void loadPosts(1, draftQuery);
	}

	function handleReset() {
		setDraftQuery('');
		setQuery('');
		void loadPosts(1, '');
	}

	function openCreateDialog() {
		setForm(emptyForm);
		setErrors({});
		setDialogOpen(true);
	}

	async function openEditDialog(postId: string) {
		try {
			setSubmitting(true);
			const response = await fetchPostDetail(postId);
			setForm({
				postId: response.data.postId,
				postCode: response.data.postCode ?? '',
				postName: response.data.postName ?? '',
				postSort: response.data.postSort ?? 0,
				remark: response.data.remark ?? '',
				createTime: response.data.createTime,
			});
			setErrors({});
			setDialogOpen(true);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '岗位详情加载失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	function validateForm(state: PostFormState) {
		const nextErrors: Record<string, string> = {};
		if (!state.postCode.trim()) nextErrors.postCode = '岗位编码不能为空。';
		if (!state.postName.trim()) nextErrors.postName = '岗位名称不能为空。';
		if (!Number.isFinite(state.postSort)) nextErrors.postSort = '岗位排序必须是数字。';
		if (!state.remark?.trim()) nextErrors.remark = '岗位描述不能为空。';
		return nextErrors;
	}

	async function handleSubmit() {
		const nextErrors = validateForm(form);
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length) return;

		try {
			setSubmitting(true);
			if (form.postId) {
				await updatePost(form);
				setFeedback({ type: 'success', message: '岗位已更新。' });
			} else {
				await createPost(form);
				setFeedback({ type: 'success', message: '岗位已创建。' });
			}
			setDialogOpen(false);
			await loadPosts(form.postId ? page : 1, query);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '岗位保存失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete(ids: string[]) {
		if (!ids.length) return;
		if (!window.confirm(`确认删除这 ${ids.length} 个岗位吗？`)) return;

		try {
			setSubmitting(true);
			await deletePosts(ids);
			setSelectedIds([]);
			setFeedback({ type: 'success', message: '岗位已删除。' });
			await loadPosts(page, query);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '岗位删除失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
					<div>
						<CardTitle className="text-2xl">岗位管理</CardTitle>
						<CardDescription>支持搜索、分页、批量删除和岗位编辑。</CardDescription>
					</div>
					<div className="flex flex-wrap gap-3">
						<Button variant="outline" onClick={() => void loadPosts(page, query)} disabled={loading}>
							刷新
						</Button>
						<Button onClick={openCreateDialog}>
							<Plus data-icon="inline-start" />
							新增岗位
						</Button>
					</div>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{feedback ? (
						<div
							className={cn(
								'rounded-2xl border px-4 py-3 text-sm',
								feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'
							)}
						>
							{feedback.message}
						</div>
					) : null}
					<div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
						<div className="relative">
							<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input className="pl-10" value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder="按岗位名称搜索" />
						</div>
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
												checked={posts.length > 0 && selectedIds.length === posts.length}
												onChange={(event) => setSelectedIds(event.target.checked ? posts.map((post) => post.postId) : [])}
											/>
										</th>
										<th className="px-4 py-3">岗位编码</th>
										<th className="px-4 py-3">岗位名称</th>
										<th className="px-4 py-3">岗位排序</th>
										<th className="px-4 py-3">岗位描述</th>
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
									) : posts.length === 0 ? (
										<tr>
											<td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
												没有符合条件的岗位。
											</td>
										</tr>
									) : (
										posts.map((post) => (
											<tr key={post.postId} className="border-t border-border/60 bg-background/70">
												<td className="px-4 py-4 align-top">
													<input
														type="checkbox"
														checked={selectedIds.includes(post.postId)}
														onChange={(event) =>
															setSelectedIds((prev) => (event.target.checked ? [...prev, post.postId] : prev.filter((item) => item !== post.postId)))
														}
													/>
												</td>
												<td className="px-4 py-4 align-top font-medium">{post.postCode}</td>
												<td className="px-4 py-4 align-top">{post.postName}</td>
												<td className="px-4 py-4 align-top">{post.postSort}</td>
												<td className="px-4 py-4 align-top text-muted-foreground">{post.remark || '-'}</td>
												<td className="px-4 py-4 align-top text-muted-foreground">{post.createTime || '-'}</td>
												<td className="px-4 py-4 align-top">
													<div className="flex justify-end gap-2">
														<Button variant="ghost" size="sm" onClick={() => void openEditDialog(post.postId)}>
															<Pencil data-icon="inline-start" />
															编辑
														</Button>
														<Button variant="ghost" size="sm" onClick={() => void handleDelete([post.postId])}>
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
						<p className="text-sm text-muted-foreground">{`第 ${page} / ${Math.max(1, Math.ceil(total / pageSize))} 页`}</p>
						<div className="flex gap-3">
							<Button variant="outline" onClick={() => void loadPosts(page - 1, query)} disabled={page <= 1 || loading}>
								上一页
							</Button>
							<Button variant="outline" onClick={() => void loadPosts(page + 1, query)} disabled={page >= totalPages || loading}>
								下一页
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<PostDialog open={dialogOpen} form={form} errors={errors} submitting={submitting} onOpenChange={setDialogOpen} onChange={setForm} onSubmit={() => void handleSubmit()} />
		</div>
	);
};

const PostDialog = ({
	open,
	form,
	errors,
	submitting,
	onOpenChange,
	onChange,
	onSubmit,
}: {
	open: boolean;
	form: PostFormState;
	errors: Record<string, string>;
	submitting: boolean;
	onOpenChange: (open: boolean) => void;
	onChange: (form: PostFormState) => void;
	onSubmit: () => void;
}) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{form.postId ? '编辑岗位' : '新增岗位'}</DialogTitle>
					<DialogDescription>编辑岗位编码、名称、排序和描述。</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4">
					<FormField label="岗位编码" error={errors.postCode}>
						<Input value={form.postCode} onChange={(event) => onChange({ ...form, postCode: event.target.value })} />
					</FormField>
					<FormField label="岗位名称" error={errors.postName}>
						<Input value={form.postName} onChange={(event) => onChange({ ...form, postName: event.target.value })} />
					</FormField>
					<FormField label="岗位排序" error={errors.postSort}>
						<Input type="number" value={String(form.postSort)} onChange={(event) => onChange({ ...form, postSort: Number(event.target.value || 0) })} />
					</FormField>
					<FormField label="岗位描述" error={errors.remark}>
						<textarea
							className="min-h-32 rounded-[24px] border border-border/70 bg-background px-4 py-3 text-sm outline-none ring-ring transition focus-visible:ring-2"
							maxLength={150}
							value={form.remark || ''}
							onChange={(event) => onChange({ ...form, remark: event.target.value })}
						/>
					</FormField>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						取消
					</Button>
					<Button onClick={onSubmit} disabled={submitting}>
						{submitting ? <LoaderCircle className="h-4 w-4 animate-spin" data-icon="inline-start" /> : <ChevronRight data-icon="inline-start" />}
						保存
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
