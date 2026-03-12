import type { ReactNode } from 'react';
import { ChevronRight, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { MenuFormState } from '../types';

export const MenuDialog = ({
    open,
    form,
    errors,
    submitting,
    parentOptions,
    onOpenChange,
    onChange,
    onSubmit,
}: {
    open: boolean;
    form: MenuFormState;
    errors: Record<string, string>;
    submitting: boolean;
    parentOptions: Array<{ id: string; name: string; depth: number }>;
    onOpenChange: (open: boolean) => void;
    onChange: (form: MenuFormState) => void;
    onSubmit: () => void;
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{form.menuId ? '编辑菜单' : '新增菜单'}</DialogTitle>
                    <DialogDescription>编辑菜单、按钮和显示配置。</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="菜单类型" error={errors.menuType}>
                        <div className="flex gap-3">
                            <ToggleChip active={form.menuType === '0'} onClick={() => onChange({ ...form, menuType: '0' })}>
                                菜单
                            </ToggleChip>
                            <ToggleChip active={form.menuType === '1'} onClick={() => onChange({ ...form, menuType: '1' })}>
                                按钮
                            </ToggleChip>
                        </div>
                    </FormField>
                    <FormField label="上级菜单" error={errors.parentId}>
                        <select
                            className="h-12 w-full rounded-2xl border border-border/70 bg-background px-4 text-sm"
                            value={form.parentId}
                            onChange={(event) => onChange({ ...form, parentId: event.target.value })}
                        >
                            {parentOptions.map((option) => (
                                <option key={option.id} value={option.id}>{`${' '.repeat(option.depth * 2)}${option.name}`}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label="菜单名称" error={errors.name}>
                        <Input value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} />
                    </FormField>
                    <FormField label="英文名称">
                        <Input value={form.enName} onChange={(event) => onChange({ ...form, enName: event.target.value })} />
                    </FormField>
                    {form.menuType === '0' ? (
                        <>
                            <FormField label="路径" error={errors.path}>
                                <Input value={form.path} onChange={(event) => onChange({ ...form, path: event.target.value })} />
                            </FormField>
                            <FormField label="图标" error={errors.icon}>
                                <Input
                                    value={form.icon}
                                    onChange={(event) => onChange({ ...form, icon: event.target.value })}
                                    placeholder="例如 icon-shouye"
                                />
                            </FormField>
                        </>
                    ) : (
                        <FormField label="权限标识" error={errors.permission}>
                            <Input
                                value={form.permission}
                                onChange={(event) => onChange({ ...form, permission: event.target.value })}
                                placeholder="例如 sys_menu_add"
                            />
                        </FormField>
                    )}
                    <FormField label="排序">
                        <Input
                            type="number"
                            value={String(form.sortOrder)}
                            onChange={(event) => onChange({ ...form, sortOrder: Number(event.target.value || 0) })}
                        />
                    </FormField>
                </div>
                {form.menuType === '0' ? (
                    <div className="grid gap-4 md:grid-cols-3">
                        <FormField label="缓存">
                            <div className="flex gap-3">
                                <ToggleChip active={form.keepAlive === '1'} onClick={() => onChange({ ...form, keepAlive: '1' })}>
                                    开启
                                </ToggleChip>
                                <ToggleChip active={form.keepAlive === '0'} onClick={() => onChange({ ...form, keepAlive: '0' })}>
                                    关闭
                                </ToggleChip>
                            </div>
                        </FormField>
                        <FormField label="显示">
                            <div className="flex gap-3">
                                <ToggleChip active={form.visible === '1'} onClick={() => onChange({ ...form, visible: '1' })}>
                                    显示
                                </ToggleChip>
                                <ToggleChip active={form.visible === '0'} onClick={() => onChange({ ...form, visible: '0' })}>
                                    隐藏
                                </ToggleChip>
                            </div>
                        </FormField>
                        <FormField label="嵌套">
                            <div className="flex gap-3">
                                <ToggleChip active={form.embedded === '1'} onClick={() => onChange({ ...form, embedded: '1' })}>
                                    是
                                </ToggleChip>
                                <ToggleChip active={form.embedded === '0'} onClick={() => onChange({ ...form, embedded: '0' })}>
                                    否
                                </ToggleChip>
                            </div>
                        </FormField>
                    </div>
                ) : null}
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

const ToggleChip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) => (
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
