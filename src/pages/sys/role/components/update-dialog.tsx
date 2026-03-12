import type { ReactNode } from 'react';
import { ChevronRight, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import type { RoleFormState } from '../types';

export const RoleDialog = ({ open, form, errors, submitting, onOpenChange, onChange, onSubmit }: { open: boolean; form: RoleFormState; errors: Record<string, string>; submitting: boolean; onOpenChange: (open: boolean) => void; onChange: (form: RoleFormState) => void; onSubmit: () => void; }) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader><DialogTitle>{form.roleId ? '编辑角色' : '新增角色'}</DialogTitle><DialogDescription>字段结构和原表单一致，保留角色名称、标识和描述。</DialogDescription></DialogHeader>
				<div className="grid gap-4">
					<FormField label="角色名称" error={errors.roleName}><Input value={form.roleName} onChange={(event) => onChange({ ...form, roleName: event.target.value })} /></FormField>
					<FormField label="角色标识" error={errors.roleCode}><Input value={form.roleCode} disabled={Boolean(form.roleId)} onChange={(event) => onChange({ ...form, roleCode: event.target.value.toUpperCase() })} /></FormField>
					<FormField label="角色描述" error={errors.roleDesc}><textarea className="min-h-32 rounded-[24px] border border-border/70 bg-background px-4 py-3 text-sm outline-none ring-ring transition focus-visible:ring-2" maxLength={128} value={form.roleDesc} onChange={(event) => onChange({ ...form, roleDesc: event.target.value })} /></FormField>
				</div>
				<DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button><Button onClick={onSubmit} disabled={submitting}>{submitting ? <LoaderCircle className="h-4 w-4 animate-spin" data-icon="inline-start" /> : <ChevronRight data-icon="inline-start" />}保存</Button></DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
