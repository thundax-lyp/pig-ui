import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, LoaderCircle, Pencil, Plus, Search, ShieldAlert, Trash2, UserRoundCheck } from 'lucide-react';
import { createUser, deleteUsers, fetchDeptTree, fetchPostList, fetchRoleList, fetchUserDetails, fetchUserPage, updateUser } from './service';
import type { DeptTreeNode, PostOption, RoleOption, UserDetails, UserListItem } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type UserFormState = {
	userId: string;
	username: string;
	password: string;
	name: string;
	phone: string;
	email: string;
	nickname: string;
	lockFlag: '0' | '9';
	deptId: string;
	role: string[];
	post: string[];
};

const emptyForm: UserFormState = {
	userId: '',
	username: '',
	password: '',
	name: '',
	phone: '',
	email: '',
	nickname: '',
	lockFlag: '0',
	deptId: '',
	role: [],
	post: [],
};

export const AdminUserPage = () => {
	const [users, setUsers] = useState<UserListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [query, setQuery] = useState({ username: '', phone: '', deptId: '' });
	const [draftQuery, setDraftQuery] = useState({ username: '', phone: '' });
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [deptTree, setDeptTree] = useState<DeptTreeNode[]>([]);
	const [roles, setRoles] = useState<RoleOption[]>([]);
	const [posts, setPosts] = useState<PostOption[]>([]);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [form, setForm] = useState<UserFormState>(emptyForm);
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

	const flattenedDepartments = useMemo(() => flattenDepartments(deptTree), [deptTree]);
	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	useEffect(() => {
		void Promise.all([loadUsers(1, query), loadReferenceData()]);
	}, []);

	async function loadReferenceData() {
		try {
			const [deptRes, roleRes, postRes] = await Promise.all([fetchDeptTree(), fetchRoleList(), fetchPostList()]);
			setDeptTree(deptRes.data ?? []);
			setRoles(roleRes.data ?? []);
			setPosts(postRes.data ?? []);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '基础数据加载失败。' });
		}
	}

	async function loadUsers(nextPage = page, nextQuery = query) {
		try {
			setLoading(true);
			const response = await fetchUserPage({
				current: nextPage,
				size: pageSize,
				username: nextQuery.username || undefined,
				phone: nextQuery.phone || undefined,
				deptId: nextQuery.deptId || undefined,
			});
			setUsers(response.data.records ?? []);
			setTotal(response.data.total ?? 0);
			setPage(nextPage);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '用户列表加载失败。' });
		} finally {
			setLoading(false);
		}
	}

	function handleSearch() {
		const nextQuery = { ...query, ...draftQuery };
		setQuery(nextQuery);
		void loadUsers(1, nextQuery);
	}

	function handleReset() {
		const nextQuery = { username: '', phone: '', deptId: '' };
		setDraftQuery({ username: '', phone: '' });
		setQuery(nextQuery);
		void loadUsers(1, nextQuery);
	}

	function openCreateDialog() {
		setForm({
			...emptyForm,
			deptId: flattenedDepartments[0]?.id ?? '',
			role: roles[0] ? [roles[0].roleId] : [],
			post: posts[0] ? [posts[0].postId] : [],
		});
		setFormErrors({});
		setDialogOpen(true);
	}

	async function openEditDialog(userId: string) {
		try {
			setSubmitting(true);
			const response = await fetchUserDetails(userId);
			const data = response.data;
			setForm({
				userId: data.userId,
				username: data.username ?? '',
				password: '',
				name: data.name ?? '',
				phone: data.phone ?? '',
				email: data.email ?? '',
				nickname: data.nickname ?? '',
				lockFlag: data.lockFlag ?? '0',
				deptId: data.dept?.deptId ?? data.deptId ?? '',
				role: data.roleList?.map((item) => item.roleId) ?? data.role ?? [],
				post: data.postList?.map((item) => item.postId) ?? data.post ?? [],
			});
			setFormErrors({});
			setDialogOpen(true);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '用户详情加载失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	function validateForm(state: UserFormState) {
		const errors: Record<string, string> = {};
		if (!state.userId && state.username.trim().length < 5) errors.username = '用户名至少 5 位。';
		if (!state.userId && state.password.trim().length < 6) errors.password = '新增用户时密码至少 6 位。';
		if (!state.name.trim()) errors.name = '姓名不能为空。';
		if (!/^1\d{10}$/.test(state.phone.trim())) errors.phone = '请输入正确的手机号。';
		if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) errors.email = '邮箱格式不正确。';
		if (!state.deptId) errors.deptId = '请选择所属部门。';
		if (!state.role.length) errors.role = '至少选择一个角色。';
		if (!state.post.length) errors.post = '至少选择一个岗位。';
		return errors;
	}

	async function handleSubmit() {
		const errors = validateForm(form);
		setFormErrors(errors);
		if (Object.keys(errors).length > 0) return;

		const payload = {
			...form,
			password: form.password || undefined,
		};

		try {
			setSubmitting(true);
			if (form.userId) {
				await updateUser(payload);
				setFeedback({ type: 'success', message: '用户已更新。' });
			} else {
				await createUser(payload);
				setFeedback({ type: 'success', message: '用户已创建。' });
			}
			setDialogOpen(false);
			await loadUsers(form.userId ? page : 1, query);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '保存失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete(ids: string[]) {
		if (!ids.length) return;
		const confirmed = window.confirm(`确认删除这 ${ids.length} 个用户吗？`);
		if (!confirmed) return;

		try {
			setSubmitting(true);
			await deleteUsers(ids);
			setSelectedIds([]);
			setFeedback({ type: 'success', message: '用户已删除。' });
			await loadUsers(page, query);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '删除失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	async function handleToggleLock(user: UserListItem) {
		try {
			setSubmitting(true);
			await updateUser({
				userId: user.userId,
				username: user.username,
				name: user.name,
				phone: user.phone,
				email: user.email,
				nickname: user.nickname,
				lockFlag: user.lockFlag === '0' ? '9' : '0',
				deptId: user.dept?.deptId,
				role: user.roleList?.map((item) => item.roleId) ?? [],
				post: user.postList?.map((item) => item.postId) ?? [],
			});
			setFeedback({ type: 'success', message: `${user.username} 状态已更新。` });
			await loadUsers(page, query);
		} catch (error: any) {
			setFeedback({ type: 'error', message: error?.msg ?? '状态更新失败。' });
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
			<Card className="h-fit">
				<CardHeader>
					<CardTitle>部门筛选</CardTitle>
					<CardDescription>沿用原左侧部门树筛选布局，支持快速切换查询范围。</CardDescription>
				</CardHeader>
				<CardContent className="max-h-[calc(100vh-16rem)] overflow-auto">
					<div className="flex flex-col gap-1">
						<button
							className={cn(
								'rounded-2xl px-3 py-2 text-left text-sm transition',
								query.deptId === '' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
							)}
							onClick={() => {
								const nextQuery = { ...query, deptId: '' };
								setQuery(nextQuery);
								void loadUsers(1, nextQuery);
							}}
						>
							全部部门
						</button>
						{deptTree.map((node) => (
							<DeptNode
								key={node.id}
								node={node}
								activeDeptId={query.deptId}
								onSelect={(deptId) => {
									const nextQuery = { ...query, deptId };
									setQuery(nextQuery);
									void loadUsers(1, nextQuery);
								}}
							/>
						))}
					</div>
				</CardContent>
			</Card>

			<div className="flex min-w-0 flex-col gap-6">
				<Card>
					<CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
						<div>
							<CardTitle className="text-2xl">用户管理</CardTitle>
							<CardDescription>支持分页查询、状态切换、删除和新增编辑。</CardDescription>
						</div>
						<div className="flex flex-wrap gap-3">
							<Button variant="outline" onClick={() => void loadUsers(page, query)} disabled={loading}>
								刷新
							</Button>
							<Button onClick={openCreateDialog}>
								<Plus data-icon="inline-start" />
								新增用户
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

						<div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
							<div className="relative">
								<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input value={draftQuery.username} onChange={(event) => setDraftQuery((prev) => ({ ...prev, username: event.target.value }))} className="pl-10" placeholder="按用户名搜索" />
							</div>
							<Input value={draftQuery.phone} onChange={(event) => setDraftQuery((prev) => ({ ...prev, phone: event.target.value }))} placeholder="按手机号搜索" />
							<Button variant="outline" onClick={handleReset}>
								重置
							</Button>
							<Button onClick={handleSearch}>查询</Button>
						</div>

						<div className="flex flex-wrap items-center justify-between gap-3">
							<div className="flex flex-wrap gap-2">
								<Badge variant="secondary">总数 {total}</Badge>
								{query.deptId ? <Badge variant="outline">已按部门过滤</Badge> : null}
								{selectedIds.length ? <Badge>{`已选 ${selectedIds.length} 项`}</Badge> : null}
							</div>
							<Button variant="outline" onClick={() => void handleDelete(selectedIds)} disabled={!selectedIds.length || submitting}>
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
													checked={users.length > 0 && selectedIds.length === users.filter((user) => user.username !== 'admin').length}
													onChange={(event) =>
														setSelectedIds(event.target.checked ? users.filter((user) => user.username !== 'admin').map((user) => user.userId) : [])
													}
												/>
											</th>
											<th className="px-4 py-3">用户名</th>
											<th className="px-4 py-3">姓名</th>
											<th className="px-4 py-3">手机号</th>
											<th className="px-4 py-3">岗位</th>
											<th className="px-4 py-3">角色</th>
											<th className="px-4 py-3">状态</th>
											<th className="px-4 py-3">创建时间</th>
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
										) : users.length === 0 ? (
											<tr>
												<td colSpan={9} className="px-4 py-16 text-center text-muted-foreground">
													没有符合条件的用户。
												</td>
											</tr>
										) : (
											users.map((user) => {
												const disabledDelete = user.username === 'admin';
												return (
													<tr key={user.userId} className="border-t border-border/60 bg-background/70">
														<td className="px-4 py-4 align-top">
															<input
																type="checkbox"
																disabled={disabledDelete}
																checked={selectedIds.includes(user.userId)}
																onChange={(event) =>
																	setSelectedIds((prev) =>
																		event.target.checked ? [...prev, user.userId] : prev.filter((item) => item !== user.userId)
																	)
																}
															/>
														</td>
														<td className="px-4 py-4 align-top font-medium">{user.username}</td>
														<td className="px-4 py-4 align-top">{user.name}</td>
														<td className="px-4 py-4 align-top">{user.phone || '-'}</td>
														<td className="px-4 py-4 align-top">
															<div className="flex flex-wrap gap-2">
																{user.postList?.length ? user.postList.map((post) => <Badge key={post.postId} variant="outline">{post.postName}</Badge>) : '-'}
															</div>
														</td>
														<td className="px-4 py-4 align-top">
															<div className="flex flex-wrap gap-2">
																{user.roleList?.length ? user.roleList.map((role) => <Badge key={role.roleId} variant="secondary">{role.roleName}</Badge>) : '-'}
															</div>
														</td>
														<td className="px-4 py-4 align-top">
															<button
																className={cn(
																	'rounded-full px-3 py-1 text-xs font-medium transition',
																	user.lockFlag === '0' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
																)}
																onClick={() => void handleToggleLock(user)}
															>
																{user.lockFlag === '0' ? '启用' : '锁定'}
															</button>
														</td>
														<td className="px-4 py-4 align-top text-muted-foreground">{user.createTime || '-'}</td>
														<td className="px-4 py-4 align-top">
															<div className="flex justify-end gap-2">
																<Button variant="ghost" size="sm" onClick={() => void openEditDialog(user.userId)}>
																	<Pencil data-icon="inline-start" />
																	编辑
																</Button>
																<Button variant="ghost" size="sm" disabled={disabledDelete} onClick={() => void handleDelete([user.userId])}>
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
								<Button variant="outline" onClick={() => void loadUsers(page - 1, query)} disabled={page <= 1 || loading}>
									上一页
								</Button>
								<Button variant="outline" onClick={() => void loadUsers(page + 1, query)} disabled={page >= totalPages || loading}>
									下一页
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<UserDialog
				open={dialogOpen}
				submitting={submitting}
				form={form}
				errors={formErrors}
				roles={roles}
				posts={posts}
				departments={flattenedDepartments}
				onOpenChange={setDialogOpen}
				onChange={setForm}
				onSubmit={() => void handleSubmit()}
			/>
		</div>
	);
};

const UserDialog = ({
	open,
	submitting,
	form,
	errors,
	roles,
	posts,
	departments,
	onOpenChange,
	onChange,
	onSubmit,
}: {
	open: boolean;
	submitting: boolean;
	form: UserFormState;
	errors: Record<string, string>;
	roles: RoleOption[];
	posts: PostOption[];
	departments: Array<{ id: string; name: string; depth: number }>;
	onOpenChange: (open: boolean) => void;
	onChange: (form: UserFormState) => void;
	onSubmit: () => void;
}) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{form.userId ? '编辑用户' : '新增用户'}</DialogTitle>
					<DialogDescription>编辑用户信息、部门、角色和岗位。</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 md:grid-cols-2">
					<FormField label="用户名" error={errors.username}>
						<Input value={form.username} disabled={Boolean(form.userId)} onChange={(event) => onChange({ ...form, username: event.target.value })} />
					</FormField>
					<FormField label="密码" error={errors.password}>
						<Input
							type="password"
							placeholder={form.userId ? '留空则不修改' : '请输入密码'}
							value={form.password}
							onChange={(event) => onChange({ ...form, password: event.target.value })}
						/>
					</FormField>
					<FormField label="姓名" error={errors.name}>
						<Input value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} />
					</FormField>
					<FormField label="手机号" error={errors.phone}>
						<Input value={form.phone} onChange={(event) => onChange({ ...form, phone: event.target.value })} />
					</FormField>
					<FormField label="邮箱" error={errors.email}>
						<Input value={form.email} onChange={(event) => onChange({ ...form, email: event.target.value })} />
					</FormField>
					<FormField label="昵称">
						<Input value={form.nickname} onChange={(event) => onChange({ ...form, nickname: event.target.value })} />
					</FormField>
					<FormField label="所属部门" error={errors.deptId}>
						<select
							className="h-12 w-full rounded-2xl border border-border/70 bg-background px-4 text-sm"
							value={form.deptId}
							onChange={(event) => onChange({ ...form, deptId: event.target.value })}
						>
							<option value="">请选择部门</option>
							{departments.map((dept) => (
								<option key={dept.id} value={dept.id}>
									{`${' '.repeat(dept.depth * 2)}${dept.name}`}
								</option>
							))}
						</select>
					</FormField>
					<FormField label="状态">
						<div className="flex gap-3">
							<ToggleChip active={form.lockFlag === '0'} onClick={() => onChange({ ...form, lockFlag: '0' })}>
								<UserRoundCheck className="h-4 w-4" />
								启用
							</ToggleChip>
							<ToggleChip active={form.lockFlag === '9'} onClick={() => onChange({ ...form, lockFlag: '9' })}>
								<ShieldAlert className="h-4 w-4" />
								锁定
							</ToggleChip>
						</div>
					</FormField>
				</div>
				<div className="grid gap-4 md:grid-cols-2">
					<FormField label="角色" error={errors.role}>
						<MultiCheckList
							items={roles.map((role) => ({ id: role.roleId, label: role.roleName }))}
							values={form.role}
							onChange={(values) => onChange({ ...form, role: values })}
						/>
					</FormField>
					<FormField label="岗位" error={errors.post}>
						<MultiCheckList
							items={posts.map((post) => ({ id: post.postId, label: post.postName }))}
							values={form.post}
							onChange={(values) => onChange({ ...form, post: values })}
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


const ToggleChip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => {
	return (
		<button
			type="button"
			className={cn(
				'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition',
				active ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-muted-foreground hover:bg-accent hover:text-foreground'
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
};

const MultiCheckList = ({
	items,
	values,
	onChange,
}: {
	items: Array<{ id: string; label: string }>;
	values: string[];
	onChange: (values: string[]) => void;
}) => {
	return (
		<div className="flex max-h-48 flex-wrap gap-2 overflow-auto rounded-[24px] border border-border/70 bg-secondary/35 p-3">
			{items.map((item) => {
				const active = values.includes(item.id);
				return (
					<button
						key={item.id}
						type="button"
						className={cn(
							'rounded-full border px-3 py-1.5 text-sm transition',
							active ? 'border-primary bg-primary text-primary-foreground' : 'border-border/70 bg-background text-muted-foreground hover:text-foreground'
						)}
						onClick={() =>
							onChange(active ? values.filter((value) => value !== item.id) : [...values, item.id])
						}
					>
						{item.label}
					</button>
				);
			})}
		</div>
	);
};

const DeptNode = ({
	node,
	activeDeptId,
	onSelect,
	depth = 0,
}: {
	node: DeptTreeNode;
	activeDeptId: string;
	onSelect: (deptId: string) => void;
	depth?: number;
}) => {
	return (
		<div className="flex flex-col gap-1">
			<button
				className={cn(
					'flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm transition',
					activeDeptId === node.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
				)}
				style={{ paddingLeft: `${12 + depth * 16}px` }}
				onClick={() => onSelect(node.id)}
			>
				<ChevronRight className="h-4 w-4" />
				<span>{node.name}</span>
				{node.isLock ? <ShieldAlert className="ml-auto h-4 w-4" /> : null}
			</button>
			{node.children?.map((child) => (
				<DeptNode key={child.id} node={child} activeDeptId={activeDeptId} onSelect={onSelect} depth={depth + 1} />
			))}
		</div>
	);
};

function flattenDepartments(nodes: DeptTreeNode[], depth = 0): Array<{ id: string; name: string; depth: number }> {
	return nodes.flatMap((node) => [{ id: node.id, name: node.name, depth }, ...flattenDepartments(node.children ?? [], depth + 1)]);
}
