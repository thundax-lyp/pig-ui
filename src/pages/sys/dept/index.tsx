import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, FolderPlus, LoaderCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { createDepartment, deleteDepartment, fetchDepartmentDetail, fetchDepartmentTree, updateDepartment } from './service';
import type { DepartmentDetail, DepartmentNode } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type DepartmentFormState = DepartmentDetail;

const emptyForm: DepartmentFormState = {
	deptId: '',
	parentId: '0',
	name: '',
	sortOrder: 9999,
};

export const AdminDeptPage = () => {
	const [departments, setDepartments] = useState<DepartmentNode[]>([]);
	const [expandedIds, setExpandedIds] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [query, setQuery] = useState('');
	const [draftQuery, setDraftQuery] = useState('');
	const [dialogOpen, setDialogOpen] = useState(false);
	const [form, setForm] = useState<DepartmentFormState>(emptyForm);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

	const parentOptions = useMemo(() => [{ id: '0', name: '根部门', depth: 0 }, ...flattenDepartmentOptions(departments)], [departments]);

	useEffect(() => {
		void loadDepartments();
	}, []);

	async function loadDepartments(nextQuery = query) {
		try {
			setLoading(true);
			const response = await fetchDepartmentTree(nextQuery ? { deptName: nextQuery } : undefined);
			setDepartments(response.data ?? []);
			setExpandedIds(flattenDepartmentIds(response.data ?? []));
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '部门树加载失败。' });
		} finally {
			setLoading(false);
		}
	}

	function handleSearch() {
		setQuery(draftQuery);
		void loadDepartments(draftQuery);
	}

	function toggleExpandAll() {
		setExpandedIds((prev) => (prev.length ? [] : flattenDepartmentIds(departments)));
	}

	function openCreateDialog(parent?: DepartmentNode) {
		setForm({
			...emptyForm,
			parentId: parent?.id ?? '0',
		});
		setErrors({});
		setDialogOpen(true);
	}

	async function openEditDialog(dept: DepartmentNode) {
		try {
			setSubmitting(true);
			const response = await fetchDepartmentDetail(dept.id);
			setForm({
				...emptyForm,
				...response.data,
			});
			setErrors({});
			setDialogOpen(true);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '部门详情加载失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	function validateForm(state: DepartmentFormState) {
		const nextErrors: Record<string, string> = {};
		if (!state.parentId) nextErrors.parentId = '请选择上级部门。';
		if (!state.name.trim()) nextErrors.name = '部门名称不能为空。';
		if (!Number.isFinite(state.sortOrder)) nextErrors.sortOrder = '排序必须是数字。';
		return nextErrors;
	}

	async function handleSubmit() {
		const nextErrors = validateForm(form);
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length) return;

		try {
			setSubmitting(true);
			if (form.deptId) {
				await updateDepartment(form);
				setFeedback({ type: 'success', message: '部门已更新。' });
			} else {
				await createDepartment(form);
				setFeedback({ type: 'success', message: '部门已创建。' });
			}
			setDialogOpen(false);
			await loadDepartments(query);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '部门保存失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete(dept: DepartmentNode) {
		if (!window.confirm(`确认删除部门 ${dept.name} 吗？`)) return;
		try {
			setSubmitting(true);
			await deleteDepartment(dept.id);
			setFeedback({ type: 'success', message: '部门已删除。' });
			await loadDepartments(query);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '部门删除失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
					<div>
						<CardTitle className="text-2xl">部门管理</CardTitle>
						<CardDescription>支持部门搜索、展开收起和树级增删改。</CardDescription>
					</div>
					<div className="flex flex-wrap gap-3">
						<Button variant="outline" onClick={toggleExpandAll}>
							{expandedIds.length ? '全部收起' : '全部展开'}
						</Button>
						<Button onClick={() => openCreateDialog()}>
							<Plus data-icon="inline-start" />
							新增部门
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
					<div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
						<div className="relative">
							<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input className="pl-10" value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder="按部门名称搜索" />
						</div>
						<Button onClick={handleSearch}>查询</Button>
					</div>
					<div className="flex flex-wrap gap-2">
						<Badge variant="secondary">{`节点 ${flattenDepartmentIds(departments).length}`}</Badge>
						<Badge variant="outline">组织树</Badge>
					</div>
					<div className="overflow-hidden rounded-[28px] border border-border/70">
						<div className="grid grid-cols-[minmax(240px,1.2fr)_100px_180px_260px] bg-secondary/70 px-4 py-3 text-sm text-muted-foreground">
							<div>部门名称</div>
							<div>排序</div>
							<div>创建时间</div>
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
							) : departments.length === 0 ? (
								<div className="px-4 py-16 text-center text-sm text-muted-foreground">没有符合条件的部门。</div>
							) : (
								departments.map((dept) => (
									<DepartmentRow
										key={dept.id}
										node={dept}
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

			<DepartmentDialog
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

const DepartmentRow = ({
	node,
	expandedIds,
	onToggleExpand,
	onAddChild,
	onEdit,
	onDelete,
	depth = 0,
}: {
	node: DepartmentNode;
	expandedIds: string[];
	onToggleExpand: (id: string) => void;
	onAddChild: (node?: DepartmentNode) => void;
	onEdit: (node: DepartmentNode) => void;
	onDelete: (node: DepartmentNode) => void;
	depth?: number;
}) => {
	const expanded = expandedIds.includes(node.id);
	const hasChildren = Boolean(node.children?.length);

	return (
		<>
			<div className="grid grid-cols-[minmax(240px,1.2fr)_100px_180px_260px] items-start px-4 py-4 text-sm">
				<div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 18}px` }}>
					<button type="button" className="text-muted-foreground" onClick={() => hasChildren && onToggleExpand(node.id)}>
						{hasChildren ? expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" /> : <span className="inline-block h-4 w-4" />}
					</button>
					<span className="font-medium">{node.name}</span>
				</div>
				<div>{node.weight ?? node.sortOrder ?? '-'}</div>
				<div className="text-muted-foreground">{node.createTime || '-'}</div>
				<div className="flex justify-end gap-2">
					<Button variant="ghost" size="sm" onClick={() => onAddChild(node)}>
						<FolderPlus data-icon="inline-start" />
						新增
					</Button>
					<Button variant="ghost" size="sm" onClick={() => onEdit(node)}>
						<Pencil data-icon="inline-start" />
						编辑
					</Button>
					<Button variant="ghost" size="sm" onClick={() => void onDelete(node)}>
						<Trash2 data-icon="inline-start" />
						删除
					</Button>
				</div>
			</div>
			{hasChildren && expanded
				? node.children!.map((child) => (
						<DepartmentRow
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

const DepartmentDialog = ({
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
	form: DepartmentFormState;
	errors: Record<string, string>;
	submitting: boolean;
	parentOptions: Array<{ id: string; name: string; depth: number }>;
	onOpenChange: (open: boolean) => void;
	onChange: (form: DepartmentFormState) => void;
	onSubmit: () => void;
}) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{form.deptId ? '编辑部门' : '新增部门'}</DialogTitle>
					<DialogDescription>编辑上级部门、名称和排序。</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4">
					<FormField label="上级部门" error={errors.parentId}>
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
					<FormField label="部门名称" error={errors.name}>
						<Input value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} />
					</FormField>
					<FormField label="排序" error={errors.sortOrder}>
						<Input type="number" value={String(form.sortOrder)} onChange={(event) => onChange({ ...form, sortOrder: Number(event.target.value || 0) })} />
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


function flattenDepartmentIds(nodes: DepartmentNode[]): string[] {
	return nodes.flatMap((node) => [node.id, ...flattenDepartmentIds(node.children ?? [])]);
}

function flattenDepartmentOptions(nodes: DepartmentNode[], depth = 1): Array<{ id: string; name: string; depth: number }> {
	return nodes.flatMap((node) => [{ id: node.id, name: node.name, depth }, ...flattenDepartmentOptions(node.children ?? [], depth + 1)]);
}
