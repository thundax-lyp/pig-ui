import type { ReactNode } from 'react';
import { ChevronRight, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import type { DepartmentDetail } from '../types';

type Props = {
	open: boolean;
	form: DepartmentDetail;
	errors: Record<string, string>;
	submitting: boolean;
	parentOptions: Array<{ id: string; name: string; depth: number }>;
	onOpenChange: (open: boolean) => void;
	onChange: (form: DepartmentDetail) => void;
	onSubmit: () => void;
};

export const DepartmentDialog = ({ open, form, errors, submitting, parentOptions, onOpenChange, onChange, onSubmit }: Props) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{form.deptId ? '编辑部门' : '新增部门'}</DialogTitle>
					<DialogDescription>编辑上级部门、名称和排序。</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4">
					<FormField label="上级部门" error={errors.parentId}>
						<select className="h-12 w-full rounded-2xl border border-border/70 bg-background px-4 text-sm" value={form.parentId} onChange={(event) => onChange({ ...form, parentId: event.target.value })}>
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
