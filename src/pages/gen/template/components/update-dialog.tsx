import { ChevronRight, LoaderCircle } from 'lucide-react';
import type { TemplateFormState } from '../types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

type Props = {
    open: boolean;
    form: TemplateFormState;
    errors: Record<string, string>;
    submitting: boolean;
    onOpenChange: (open: boolean) => void;
    onChange: (form: TemplateFormState) => void;
    onSubmit: () => void;
};

export const UpdateDialog = ({ open, form, errors, submitting, onOpenChange, onChange, onSubmit }: Props) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl">
                <DialogHeader>
                    <DialogTitle>{form.id ? '编辑模板' : '新增模板'}</DialogTitle>
                    <DialogDescription>保留模板名称、输出路径、描述和模板代码。</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <FormField label="模板代码">
                        <textarea
                            className="min-h-[520px] rounded-[24px] border border-border/70 bg-zinc-950 px-4 py-3 font-mono text-sm text-zinc-100 outline-none ring-ring transition focus-visible:ring-2"
                            value={form.templateCode}
                            onChange={(event) => onChange({ ...form, templateCode: event.target.value })}
                        />
                    </FormField>
                    <div className="grid content-start gap-4">
                        <FormField label="模板名称" error={errors.templateName}>
                            <Input value={form.templateName} onChange={(event) => onChange({ ...form, templateName: event.target.value })} />
                        </FormField>
                        <FormField label="输出路径" error={errors.generatorPath}>
                            <Input value={form.generatorPath} onChange={(event) => onChange({ ...form, generatorPath: event.target.value })} />
                        </FormField>
                        <FormField label="模板描述" error={errors.templateDesc}>
                            <Input value={form.templateDesc} onChange={(event) => onChange({ ...form, templateDesc: event.target.value })} />
                        </FormField>
                    </div>
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
