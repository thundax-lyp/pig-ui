import type { ReactNode } from 'react';
import { ChevronRight, LoaderCircle, ShieldAlert, UserRoundCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { PostOption, RoleOption, UserFormState } from '../types';

export const UserDialog = ({ open, submitting, form, errors, roles, posts, departments, onOpenChange, onChange, onSubmit }: { open: boolean; submitting: boolean; form: UserFormState; errors: Record<string, string>; roles: RoleOption[]; posts: PostOption[]; departments: Array<{ id: string; name: string; depth: number }>; onOpenChange: (open: boolean) => void; onChange: (form: UserFormState) => void; onSubmit: () => void; }) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader><DialogTitle>{form.userId ? '编辑用户' : '新增用户'}</DialogTitle><DialogDescription>编辑用户信息、部门、角色和岗位。</DialogDescription></DialogHeader>
				<div className="grid gap-4 md:grid-cols-2">
					<FormField label="用户名" error={errors.username}><Input value={form.username} disabled={Boolean(form.userId)} onChange={(event) => onChange({ ...form, username: event.target.value })} /></FormField>
					<FormField label="密码" error={errors.password}><Input type="password" placeholder={form.userId ? '留空则不修改' : '请输入密码'} value={form.password} onChange={(event) => onChange({ ...form, password: event.target.value })} /></FormField>
					<FormField label="姓名" error={errors.name}><Input value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} /></FormField>
					<FormField label="手机号" error={errors.phone}><Input value={form.phone} onChange={(event) => onChange({ ...form, phone: event.target.value })} /></FormField>
					<FormField label="邮箱" error={errors.email}><Input value={form.email} onChange={(event) => onChange({ ...form, email: event.target.value })} /></FormField>
					<FormField label="昵称"><Input value={form.nickname} onChange={(event) => onChange({ ...form, nickname: event.target.value })} /></FormField>
					<FormField label="所属部门" error={errors.deptId}><select className="h-12 w-full rounded-2xl border border-border/70 bg-background px-4 text-sm" value={form.deptId} onChange={(event) => onChange({ ...form, deptId: event.target.value })}><option value="">请选择部门</option>{departments.map((dept) => <option key={dept.id} value={dept.id}>{`${' '.repeat(dept.depth * 2)}${dept.name}`}</option>)}</select></FormField>
					<FormField label="状态"><div className="flex gap-3"><ToggleChip active={form.lockFlag === '0'} onClick={() => onChange({ ...form, lockFlag: '0' })}><UserRoundCheck className="h-4 w-4" />启用</ToggleChip><ToggleChip active={form.lockFlag === '9'} onClick={() => onChange({ ...form, lockFlag: '9' })}><ShieldAlert className="h-4 w-4" />锁定</ToggleChip></div></FormField>
				</div>
				<div className="grid gap-4 md:grid-cols-2">
					<FormField label="角色" error={errors.role}><MultiCheckList items={roles.map((role) => ({ id: role.roleId, label: role.roleName }))} values={form.role} onChange={(values) => onChange({ ...form, role: values })} /></FormField>
					<FormField label="岗位" error={errors.post}><MultiCheckList items={posts.map((post) => ({ id: post.postId, label: post.postName }))} values={form.post} onChange={(values) => onChange({ ...form, post: values })} /></FormField>
				</div>
				<DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button><Button onClick={onSubmit} disabled={submitting}>{submitting ? <LoaderCircle className="h-4 w-4 animate-spin" data-icon="inline-start" /> : <ChevronRight data-icon="inline-start" />}保存</Button></DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const ToggleChip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) => <button type="button" className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition', active ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-muted-foreground hover:bg-accent hover:text-foreground')} onClick={onClick}>{children}</button>;
const MultiCheckList = ({ items, values, onChange }: { items: Array<{ id: string; label: string }>; values: string[]; onChange: (values: string[]) => void; }) => <div className="flex max-h-48 flex-wrap gap-2 overflow-auto rounded-[24px] border border-border/70 bg-secondary/35 p-3">{items.map((item) => { const active = values.includes(item.id); return <button key={item.id} type="button" className={cn('rounded-full border px-3 py-1.5 text-sm transition', active ? 'border-primary bg-primary text-primary-foreground' : 'border-border/70 bg-background text-muted-foreground hover:text-foreground')} onClick={() => onChange(active ? values.filter((value) => value !== item.id) : [...values, item.id])}>{item.label}</button>; })}</div>;
