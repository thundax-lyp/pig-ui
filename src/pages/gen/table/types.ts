export type TableRow = {
    id?: string;
    name: string;
    comment?: string;
    createTime?: string;
};

export type TableDatasource = {
    id: string;
    name: string;
    dsName?: string;
};

export type GroupOption = {
    id: string;
    groupName: string;
};

export type DictOption = {
    dictType: string;
    description: string;
};

export type TableField = {
    fieldName: string;
    fieldComment: string;
    fieldType: string;
    attrName: string;
    attrType: string;
    primaryPk: string;
    autoFill?: string;
    fieldDict?: string;
    gridItem?: string;
    gridSort?: string;
    queryItem?: string;
    queryFormType?: string;
    queryType?: string;
    formType?: string;
    formItem?: string;
    formRequired?: string;
    formValidator?: string;
};

export type TableDetail = {
    id: string;
    dsName: string;
    tableName: string;
    tableComment: string;
    className: string;
    author: string;
    packageName: string;
    moduleName: string;
    functionName: string;
    style: string;
    formLayout: number;
    generatorType: string;
    backendPath: string;
    frontendPath: string;
    childTableName?: string;
    fieldList: TableField[];
    groupList?: GroupOption[];
};

export type GeneratorBaseForm = {
    id: string;
    generatorType: string;
    formLayout: number;
    backendPath: string;
    frontendPath: string;
    packageName: string;
    author: string;
    moduleName: string;
    functionName: string;
    className: string;
    tableComment: string;
    tableName: string;
    dsName: string;
    style: string;
    childTableName: string;
};

export type GeneratedCodeFile = {
    codePath: string;
    code: string;
};

export type FormHistoryItem = {
    id: string;
    createTime?: string;
};

export type FormConfigRecord = {
    id: string;
    formInfo: string;
};
