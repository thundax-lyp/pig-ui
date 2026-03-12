import type { ReactNode } from 'react';
import { ChevronRight, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { DictItemForm, DictTypeForm } from '../types';

export const DictTypeDialog = ({
    open,
    form,
    errors,
    submitting,
    onOpenChange,
    onChange,
    onSubmit,
}: {
    open: boolean;
    form: DictTypeForm;
    errors: Record<string, string>;
    submitting: boolean;
    onOpenChange: (open: boolean) => void;
    onChange: (form: DictTypeForm) => void;
    onSubmit: () => void;
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{form.id ? '编辑字典类型' : '新增字典类型'}</DialogTitle>
                    <DialogDescription>编辑字典类型、描述、系统标识和备注。</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <FormField label="系统标识">
                        <div className="flex gap-3">
                            <ToggleChip active={form.systemFlag === '0'} onClick={() => onChange({ ...form, systemFlag: '0' })}>
                                可维护
                            </ToggleChip>
                            <ToggleChip active={form.systemFlag === '1'} onClick={() => onChange({ ...form, systemFlag: '1' })}>
                                系统内置
                            </ToggleChip>
                        </div>
                    </FormField>
                    <FormField label="字典类型" error={errors.dictType}>
                        <Input
                            value={form.dictType}
                            disabled={Boolean(form.id)}
                            onChange={(event) => onChange({ ...form, dictType: event.target.value })}
                        />
                    </FormField>
                    <FormField label="描述" error={errors.description}>
                        <Input value={form.description} onChange={(event) => onChange({ ...form, description: event.target.value })} />
                    </FormField>
                    <FormField label="备注">
                        <textarea
                            className="min-h-32 rounded-[24px] border border-border/70 bg-background px-4 py-3 text-sm outline-none ring-ring transition focus-visible:ring-2"
                            maxLength={150}
                            value={form.remarks}
                            onChange={(event) => onChange({ ...form, remarks: event.target.value })}
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

export const DictItemDialog = ({
    open,
    form,
    errors,
    submitting,
    onOpenChange,
    onChange,
    onSubmit,
}: {
    open: boolean;
    form: DictItemForm;
    errors: Record<string, string>;
    submitting: boolean;
    onOpenChange: (open: boolean) => void;
    onChange: (form: DictItemForm) => void;
    onSubmit: () => void;
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{form.id ? '编辑字典项' : '新增字典项'}</DialogTitle>
                    <DialogDescription>当前字典类型：{form.dictType || '未选择'}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <FormField label="字典类型">
                        <Input value={form.dictType} disabled />
                    </FormField>
                    <FormField label="标签" error={errors.label}>
                        <Input value={form.label} onChange={(event) => onChange({ ...form, label: event.target.value })} />
                    </FormField>
                    <FormField label="数据值" error={errors.value}>
                        <Input value={form.value} onChange={(event) => onChange({ ...form, value: event.target.value })} />
                    </FormField>
                    <FormField label="描述" error={errors.description}>
                        <Input value={form.description} onChange={(event) => onChange({ ...form, description: event.target.value })} />
                    </FormField>
                    <FormField label="排序" error={errors.sortOrder}>
                        <Input
                            type="number"
                            value={String(form.sortOrder)}
                            onChange={(event) => onChange({ ...form, sortOrder: Number(event.target.value || 0) })}
                        />
                    </FormField>
                    <FormField label="备注">
                        <textarea
                            className="min-h-28 rounded-[24px] border border-border/70 bg-background px-4 py-3 text-sm outline-none ring-ring transition focus-visible:ring-2"
                            maxLength={150}
                            value={form.remarks}
                            onChange={(event) => onChange({ ...form, remarks: event.target.value })}
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

const ToggleChip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) => {
    return (
        <button
            type="button"
            className={cn(
                'inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm transition',
                active ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
            onClick={onClick}
        >
            {children}
        </button>
    );
};
