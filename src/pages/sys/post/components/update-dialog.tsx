import type { ReactNode } from 'react';
import { ChevronRight, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import type { PostFormState } from '../types';

export const PostDialog = ({ open, form, errors, submitting, onOpenChange, onChange, onSubmit }: { open: boolean; form: PostFormState; errors: Record<string, string>; submitting: boolean; onOpenChange: (open: boolean) => void; onChange: (form: PostFormState) => void; onSubmit: () => void; }) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader><DialogTitle>{form.postId ? '编辑岗位' : '新增岗位'}</DialogTitle><DialogDescription>编辑岗位编码、名称、排序和描述。</DialogDescription></DialogHeader>
				<div className="grid gap-4">
					<FormField label="岗位编码" error={errors.postCode}><Input value={form.postCode} onChange={(event) => onChange({ ...form, postCode: event.target.value })} /></FormField>
					<FormField label="岗位名称" error={errors.postName}><Input value={form.postName} onChange={(event) => onChange({ ...form, postName: event.target.value })} /></FormField>
					<FormField label="岗位排序" error={errors.postSort}><Input type="number" value={String(form.postSort)} onChange={(event) => onChange({ ...form, postSort: Number(event.target.value || 0) })} /></FormField>
					<FormField label="岗位描述" error={errors.remark}><textarea className="min-h-32 rounded-[24px] border border-border/70 bg-background px-4 py-3 text-sm outline-none ring-ring transition focus-visible:ring-2" maxLength={150} value={form.remark || ''} onChange={(event) => onChange({ ...form, remark: event.target.value })} /></FormField>
				</div>
				<DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button><Button onClick={onSubmit} disabled={submitting}>{submitting ? <LoaderCircle className="h-4 w-4 animate-spin" data-icon="inline-start" /> : <ChevronRight data-icon="inline-start" />}保存</Button></DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
