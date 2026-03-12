export type GroupItem = {
    id: string;
    groupName: string;
    groupDesc?: string;
    createTime?: string;
    templateList?: TemplateOption[];
};

export type TemplateOption = {
    id: string;
    templateName: string;
};

export type GroupFormState = {
    id: string;
    groupName: string;
    groupDesc: string;
    templateId: string[];
};
