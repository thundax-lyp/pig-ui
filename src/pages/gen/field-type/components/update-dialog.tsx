import { ChevronRight, LoaderCircle } from 'lucide-react';
import type { FieldTypeFormState } from '../types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

type Props = {
	open: boolean;
	form: FieldTypeFormState;
	errors: Record<string, string>;
	submitting: boolean;
	onOpenChange: (open: boolean) => void;
	onChange: (form: FieldTypeFormState) => void;
	onSubmit: () => void;
};

export const UpdateDialog = ({ open, form, errors, submitting, onOpenChange, onChange, onSubmit }: Props) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{form.id ? '编辑字段类型' : '新增字段类型'}</DialogTitle>
					<DialogDescription>维护数据库字段类型和代码属性类型的映射关系。</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4">
					<FormField label="字段类型" error={errors.columnType}>
						<Input value={form.columnType} disabled={Boolean(form.id)} onChange={(event) => onChange({ ...form, columnType: event.target.value })} />
					</FormField>
					<FormField label="属性类型" error={errors.attrType}>
						<Input value={form.attrType} onChange={(event) => onChange({ ...form, attrType: event.target.value })} />
					</FormField>
					<FormField label="包名" error={errors.packageName}>
						<Input value={form.packageName} onChange={(event) => onChange({ ...form, packageName: event.target.value })} />
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
