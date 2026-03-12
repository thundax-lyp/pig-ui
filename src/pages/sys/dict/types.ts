export type DictTypeItem = {
    id: string;
    dictType: string;
    description: string;
    systemFlag: string;
    remarks?: string;
};

export type DictItem = {
    id: string;
    dictId: string;
    dictType: string;
    value: string;
    label: string;
    description: string;
    sortOrder: number;
    remarks?: string;
    createTime?: string;
};

export type DictOption = {
    label: string;
    value: string;
    elTagType?: string;
    elTagClass?: string;
};

export type DictTypeForm = {
    id: string;
    dictType: string;
    description: string;
    systemFlag: string;
    remarks: string;
};

export type DictItemForm = {
    id: string;
    dictId: string;
    dictType: string;
    value: string;
    label: string;
    description: string;
    sortOrder: number;
    remarks: string;
};
