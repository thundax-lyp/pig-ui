import type { DictOption, TableField } from '@/pages/gen/table/types';

type Props = {
    fields: TableField[];
    dictOptions: DictOption[];
    attrTypeOptions: string[];
    onChange: (fields: TableField[]) => void;
};

const fillOptions = ['DEFAULT', 'INSERT', 'UPDATE', 'INSERT_UPDATE'];
const queryOptions = ['=', '!=', '>', '>=', '<', '<=', 'like', 'left like', 'right like'];
const formTypeOptions = ['text', 'textarea', 'number', 'editor', 'select', 'radio', 'checkbox', 'date', 'datetime', 'upload-file', 'upload-img'];
const queryTypeOptions = ['text', 'textarea', 'number', 'select', 'radio', 'checkbox', 'date', 'datetime'];
const validatorOptions = [
    'duplicate',
    'number',
    'letter',
    'letterAndNumber',
    'mobilePhone',
    'letterStartNumberIncluded',
    'noChinese',
    'chinese',
    'email',
    'url',
];

export const FieldSettings = ({ fields, dictOptions, attrTypeOptions, onChange }: Props) => {
    const updateField = (index: number, key: keyof TableField, value: string) => {
        onChange(fields.map((item, current) => (current === index ? { ...item, [key]: value } : item)));
    };

    const toggleField = (index: number, key: keyof TableField, checked: boolean) => {
        updateField(index, key, checked ? '1' : '0');
    };

    return (
        <div className="overflow-hidden rounded-[28px] border border-border/70">
            <div className="overflow-x-auto">
                <table className="min-w-[1600px] bg-card/70 text-sm">
                    <thead className="bg-secondary/70 text-left text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3">主键</th>
                            <th className="px-4 py-3">字段名</th>
                            <th className="px-4 py-3">说明</th>
                            <th className="px-4 py-3">字段类型</th>
                            <th className="px-4 py-3">属性名</th>
                            <th className="px-4 py-3">属性类型</th>
                            <th className="px-4 py-3">自动填充</th>
                            <th className="px-4 py-3">字典</th>
                            <th className="px-4 py-3">列表显示</th>
                            <th className="px-4 py-3">排序</th>
                            <th className="px-4 py-3">查询显示</th>
                            <th className="px-4 py-3">查询组件</th>
                            <th className="px-4 py-3">查询方式</th>
                            <th className="px-4 py-3">表单类型</th>
                            <th className="px-4 py-3">表单显示</th>
                            <th className="px-4 py-3">必填</th>
                            <th className="px-4 py-3">校验</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map((field, index) => (
                            <tr key={`${field.fieldName}-${index}`} className="border-t border-border/60 bg-background/70">
                                <td className="px-4 py-3">
                                    <input type="checkbox" checked={field.primaryPk === '1'} disabled />
                                </td>
                                <td className="px-4 py-3 font-medium">{field.fieldName}</td>
                                <td className="px-4 py-3">
                                    <input
                                        className="h-10 w-40 rounded-xl border border-border/70 bg-background px-3"
                                        value={field.fieldComment || ''}
                                        onChange={(event) => updateField(index, 'fieldComment', event.target.value)}
                                    />
                                </td>
                                <td className="px-4 py-3">{field.fieldType}</td>
                                <td className="px-4 py-3">
                                    <input
                                        className="h-10 w-40 rounded-xl border border-border/70 bg-background px-3"
                                        value={field.attrName || ''}
                                        onChange={(event) => updateField(index, 'attrName', event.target.value)}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        className="h-10 w-40 rounded-xl border border-border/70 bg-background px-3"
                                        value={field.attrType || ''}
                                        onChange={(event) => updateField(index, 'attrType', event.target.value)}
                                    >
                                        {attrTypeOptions.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        className="h-10 w-36 rounded-xl border border-border/70 bg-background px-3"
                                        value={field.autoFill || ''}
                                        onChange={(event) => updateField(index, 'autoFill', event.target.value)}
                                    >
                                        <option value="">无</option>
                                        {fillOptions.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        className="h-10 w-40 rounded-xl border border-border/70 bg-background px-3"
                                        value={field.fieldDict || ''}
                                        onChange={(event) => updateField(index, 'fieldDict', event.target.value)}
                                    >
                                        <option value="">无</option>
                                        {dictOptions.map((item) => (
                                            <option key={item.dictType} value={item.dictType}>
                                                {item.description}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={field.gridItem === '1'}
                                        onChange={(event) => toggleField(index, 'gridItem', event.target.checked)}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={field.gridSort === '1'}
                                        onChange={(event) => toggleField(index, 'gridSort', event.target.checked)}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={field.queryItem === '1'}
                                        onChange={(event) => toggleField(index, 'queryItem', event.target.checked)}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        className="h-10 w-36 rounded-xl border border-border/70 bg-background px-3"
                                        value={field.queryFormType || ''}
                                        onChange={(event) => updateField(index, 'queryFormType', event.target.value)}
                                    >
                                        <option value="">无</option>
                                        {queryTypeOptions.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        className="h-10 w-36 rounded-xl border border-border/70 bg-background px-3"
                                        value={field.queryType || ''}
                                        onChange={(event) => updateField(index, 'queryType', event.target.value)}
                                    >
                                        <option value="">无</option>
                                        {queryOptions.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        className="h-10 w-36 rounded-xl border border-border/70 bg-background px-3"
                                        value={field.formType || ''}
                                        onChange={(event) => updateField(index, 'formType', event.target.value)}
                                    >
                                        <option value="">无</option>
                                        {formTypeOptions.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={field.formItem === '1'}
                                        onChange={(event) => toggleField(index, 'formItem', event.target.checked)}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={field.formRequired === '1'}
                                        onChange={(event) => toggleField(index, 'formRequired', event.target.checked)}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        className="h-10 w-40 rounded-xl border border-border/70 bg-background px-3"
                                        value={field.formValidator || ''}
                                        onChange={(event) => updateField(index, 'formValidator', event.target.value)}
                                    >
                                        <option value="">无</option>
                                        {validatorOptions.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
