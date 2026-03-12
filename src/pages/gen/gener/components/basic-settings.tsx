import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import type { GeneratorBaseForm, GroupOption } from '@/pages/gen/table/types';
import { cn } from '@/lib/utils';

type Props = {
    form: GeneratorBaseForm;
    groupOptions: GroupOption[];
    onChange: (updater: (prev: GeneratorBaseForm) => GeneratorBaseForm) => void;
};

export const BasicSettings = ({ form, groupOptions, onChange }: Props) => {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <FormField label="表名">
                <Input value={form.childTableName ? `${form.tableName} + ${form.childTableName}` : form.tableName} disabled />
            </FormField>
            <FormField label="注释">
                <Input value={form.tableComment} onChange={(event) => onChange((prev) => ({ ...prev, tableComment: event.target.value }))} />
            </FormField>
            <FormField label="类名">
                <Input value={form.className} onChange={(event) => onChange((prev) => ({ ...prev, className: event.target.value }))} />
            </FormField>
            <FormField label="作者">
                <Input value={form.author} onChange={(event) => onChange((prev) => ({ ...prev, author: event.target.value }))} />
            </FormField>
            <FormField label="项目包名">
                <Input value={form.packageName} onChange={(event) => onChange((prev) => ({ ...prev, packageName: event.target.value }))} />
            </FormField>
            <FormField label="模块名">
                <Input value={form.moduleName} onChange={(event) => onChange((prev) => ({ ...prev, moduleName: event.target.value }))} />
            </FormField>
            <FormField label="功能名">
                <Input value={form.functionName} onChange={(event) => onChange((prev) => ({ ...prev, functionName: event.target.value }))} />
            </FormField>
            <FormField label="代码风格">
                <select
                    className="h-12 rounded-2xl border border-border/70 bg-background px-4 text-sm"
                    value={form.style}
                    onChange={(event) => onChange((prev) => ({ ...prev, style: event.target.value }))}
                >
                    <option value="">请选择</option>
                    {groupOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.groupName}
                        </option>
                    ))}
                </select>
            </FormField>
            <FormField label="表单布局">
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: '一列', value: 1 },
                        { label: '两列', value: 2 },
                    ].map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            className={cn(
                                'rounded-full border px-4 py-2 text-sm transition',
                                form.formLayout === item.value
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border/70 bg-background text-muted-foreground hover:text-foreground'
                            )}
                            onClick={() => onChange((prev) => ({ ...prev, formLayout: item.value }))}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </FormField>
            <FormField label="生成方式">
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: '自定义路径', value: '1' },
                        { label: 'ZIP 压缩包', value: '0' },
                    ].map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            className={cn(
                                'rounded-full border px-4 py-2 text-sm transition',
                                form.generatorType === item.value
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border/70 bg-background text-muted-foreground hover:text-foreground'
                            )}
                            onClick={() => onChange((prev) => ({ ...prev, generatorType: item.value }))}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </FormField>
            {form.generatorType === '1' ? (
                <>
                    <FormField label="后端生成路径">
                        <Input value={form.backendPath} onChange={(event) => onChange((prev) => ({ ...prev, backendPath: event.target.value }))} />
                    </FormField>
                    <FormField label="前端生成路径">
                        <Input value={form.frontendPath} onChange={(event) => onChange((prev) => ({ ...prev, frontendPath: event.target.value }))} />
                    </FormField>
                </>
            ) : null}
        </div>
    );
};
