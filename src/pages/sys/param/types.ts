export type ParamItem = {
    publicId: string;
    publicName: string;
    publicKey: string;
    publicValue: string;
    status: string;
    systemFlag: string;
    publicType: string;
    validateCode?: string;
    createTime?: string;
};

export type ParamDetail = ParamItem;

export type ParamFormState = ParamDetail;
