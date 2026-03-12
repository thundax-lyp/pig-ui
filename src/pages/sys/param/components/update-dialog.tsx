import type { ReactNode } from 'react';
import { ChevronRight, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { DictOption } from '@/pages/sys/dict/types';
import type { ParamFormState } from '../types';

type Props = {
    open: boolean;
    form: ParamFormState;
    errors: Record<string, string>;
    submitting: boolean;
    dictTypeOptions: DictOption[];
    statusOptions: DictOption[];
    paramTypeOptions: DictOption[];
    onOpenChange: (open: boolean) => void;
    onChange: (updater: (prev: ParamFormState) => ParamFormState) => void;
    onSubmit: () => void;
};

export const ParamFormDialog = ({
    open,
    form,
    errors,
    submitting,
    dictTypeOptions,
    statusOptions,
    paramTypeOptions,
    onOpenChange,
    onChange,
    onSubmit,
}: Props) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{form.publicId ? '编辑参数' : '新增参数'}</DialogTitle>
                    <DialogDescription>保留系统标识、参数类型、校验编码、参数名称/键/值和状态字段。</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="系统标识" error={errors.systemFlag}>
                        <div className="flex flex-wrap gap-2">
                            {dictTypeOptions.map((option) => (
                                <ToggleChip
                                    key={option.value}
                                    active={form.systemFlag === option.value}
                                    onClick={() => onChange((prev) => ({ ...prev, systemFlag: option.value }))}
                                >
                                    {option.label}
                                </ToggleChip>
                            ))}
                        </div>
                    </FormField>
                    <FormField label="参数类型" error={errors.publicType}>
                        <div className="flex flex-wrap gap-2">
                            {paramTypeOptions.map((option) => (
                                <ToggleChip
                                    key={option.value}
                                    active={form.publicType === option.value}
                                    onClick={() => onChange((prev) => ({ ...prev, publicType: option.value }))}
                                >
                                    {option.label}
                                </ToggleChip>
                            ))}
                        </div>
                    </FormField>
                    <FormField label="校验编码">
                        <Input
                            value={form.validateCode || ''}
                            onChange={(event) => onChange((prev) => ({ ...prev, validateCode: event.target.value }))}
                        />
                    </FormField>
                    <FormField label="参数名称" error={errors.publicName}>
                        <Input value={form.publicName} onChange={(event) => onChange((prev) => ({ ...prev, publicName: event.target.value }))} />
                    </FormField>
                    <FormField label="参数键" error={errors.publicKey}>
                        <Input
                            value={form.publicKey}
                            onChange={(event) => onChange((prev) => ({ ...prev, publicKey: event.target.value.toUpperCase() }))}
                        />
                    </FormField>
                    <FormField label="参数值" error={errors.publicValue}>
                        <Input value={form.publicValue} onChange={(event) => onChange((prev) => ({ ...prev, publicValue: event.target.value }))} />
                    </FormField>
                    <FormField label="状态" error={errors.status}>
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map((option) => (
                                <ToggleChip
                                    key={option.value}
                                    active={form.status === option.value}
                                    onClick={() => onChange((prev) => ({ ...prev, status: option.value }))}
                                >
                                    {option.label}
                                </ToggleChip>
                            ))}
                        </div>
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
