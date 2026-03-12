import { ChevronRight, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import type { DictOption } from '@/pages/sys/dict/types';
import type { JobFormState } from '../types';

type Props = {
    open: boolean;
    form: JobFormState;
    errors: Record<string, string>;
    submitting: boolean;
    jobTypeOptions: DictOption[];
    misfirePolicyOptions: DictOption[];
    onOpenChange: (open: boolean) => void;
    onChange: (updater: (prev: JobFormState) => JobFormState) => void;
    onSubmit: () => void;
};

export const JobFormDialog = ({ open, form, errors, submitting, jobTypeOptions, misfirePolicyOptions, onOpenChange, onChange, onSubmit }: Props) => {
    const isPathJob = ['3', '4'].includes(form.jobType);
    const isBeanJob = ['1', '2'].includes(form.jobType);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{form.jobId ? '编辑任务' : '新增任务'}</DialogTitle>
                    <DialogDescription>保留任务类型、执行路径/类方法、Cron 和失火策略等核心配置。</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="任务名称" error={errors.jobName}>
                        <Input value={form.jobName} onChange={(event) => onChange((prev) => ({ ...prev, jobName: event.target.value }))} />
                    </FormField>
                    <FormField label="任务组" error={errors.jobGroup}>
                        <Input value={form.jobGroup} onChange={(event) => onChange((prev) => ({ ...prev, jobGroup: event.target.value }))} />
                    </FormField>
                    <FormField label="任务类型" error={errors.jobType}>
                        <select
                            className="h-12 rounded-2xl border border-border/70 bg-background px-4 text-sm"
                            value={form.jobType}
                            onChange={(event) => onChange((prev) => ({ ...prev, jobType: event.target.value }))}
                        >
                            <option value="">请选择</option>
                            {jobTypeOptions.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    {isPathJob ? (
                        <FormField label="执行路径" error={errors.executePath}>
                            <Input
                                value={form.executePath}
                                onChange={(event) => onChange((prev) => ({ ...prev, executePath: event.target.value }))}
                            />
                        </FormField>
                    ) : null}
                    {isBeanJob ? (
                        <>
                            <FormField label="类名" error={errors.className}>
                                <Input
                                    value={form.className}
                                    onChange={(event) => onChange((prev) => ({ ...prev, className: event.target.value }))}
                                />
                            </FormField>
                            <FormField label="方法名" error={errors.methodName}>
                                <Input
                                    value={form.methodName}
                                    onChange={(event) => onChange((prev) => ({ ...prev, methodName: event.target.value }))}
                                />
                            </FormField>
                        </>
                    ) : null}
                    <FormField label="方法参数">
                        <Input
                            value={form.methodParamsValue}
                            onChange={(event) => onChange((prev) => ({ ...prev, methodParamsValue: event.target.value }))}
                        />
                    </FormField>
                    <FormField label="Cron" error={errors.cronExpression}>
                        <Input
                            value={form.cronExpression}
                            onChange={(event) => onChange((prev) => ({ ...prev, cronExpression: event.target.value }))}
                            placeholder="0 0/5 * * * ?"
                        />
                    </FormField>
                    <FormField label="失火策略" error={errors.misfirePolicy}>
                        <select
                            className="h-12 rounded-2xl border border-border/70 bg-background px-4 text-sm"
                            value={form.misfirePolicy}
                            onChange={(event) => onChange((prev) => ({ ...prev, misfirePolicy: event.target.value }))}
                        >
                            <option value="">请选择</option>
                            {misfirePolicyOptions.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label="备注">
                        <textarea
                            className="min-h-28 rounded-[24px] border border-border/70 bg-background px-4 py-3 text-sm outline-none ring-ring transition focus-visible:ring-2"
                            value={form.remark}
                            onChange={(event) => onChange((prev) => ({ ...prev, remark: event.target.value }))}
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
