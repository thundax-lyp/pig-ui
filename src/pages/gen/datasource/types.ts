export type DatasourceItem = {
    id: string;
    name: string;
    dsName: string;
    dsType: string;
    username: string;
    confType: number;
    host?: string;
    port?: number;
    url?: string;
    instance?: string;
    createTime?: string;
};

export type DatasourceFormState = {
    id: string;
    name: string;
    url: string;
    username: string;
    password: string;
    dsType: string;
    confType: number;
    dsName: string;
    instance: string;
    port: number;
    host: string;
};

export type DatasourceOption = {
    label: string;
    value: string;
};
