import { ChevronRight, LoaderCircle } from 'lucide-react';
import type { GroupFormState, TemplateOption } from '../types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = {
    open: boolean;
    form: GroupFormState;
    errors: Record<string, string>;
    submitting: boolean;
    templateOptions: TemplateOption[];
    onOpenChange: (open: boolean) => void;
    onChange: (updater: (prev: GroupFormState) => GroupFormState) => void;
    onSubmit: () => void;
};

export const UpdateDialog = ({ open, form, errors, submitting, templateOptions, onOpenChange, onChange, onSubmit }: Props) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{form.id ? '编辑分组' : '新增分组'}</DialogTitle>
                    <DialogDescription>一个分组可以绑定多个模板，用于生成风格归类。</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <FormField label="分组名称" error={errors.groupName}>
                        <Input value={form.groupName} onChange={(event) => onChange((prev) => ({ ...prev, groupName: event.target.value }))} />
                    </FormField>
                    <FormField label="模板" error={errors.templateId}>
                        <div className="flex flex-wrap gap-2 rounded-[24px] border border-border/70 bg-secondary/35 p-3">
                            {templateOptions.map((item) => {
                                const active = form.templateId.includes(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className={cn(
                                            'rounded-full border px-3 py-1.5 text-sm transition',
                                            active
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border/70 bg-background text-muted-foreground hover:text-foreground'
                                        )}
                                        onClick={() =>
                                            onChange((prev) => ({
                                                ...prev,
                                                templateId: active
                                                    ? prev.templateId.filter((value) => value !== item.id)
                                                    : [...prev.templateId, item.id],
                                            }))
                                        }
                                    >
                                        {item.templateName}
                                    </button>
                                );
                            })}
                        </div>
                    </FormField>
                    <FormField label="分组描述">
                        <textarea
                            className="min-h-32 rounded-[24px] border border-border/70 bg-background px-4 py-3 text-sm outline-none ring-ring transition focus-visible:ring-2"
                            maxLength={100}
                            value={form.groupDesc}
                            onChange={(event) => onChange((prev) => ({ ...prev, groupDesc: event.target.value }))}
                        />
                    </FormField>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        取消
                    </Button>
                    <Button onClick={onSubmit} disabled={submitting}>
                        {submitting ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" data-icon="inline-start" />
                        ) : (
                            <ChevronRight data-icon="inline-start" />
                        )}
                        保存
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
