export type ClientItem = {
    id: string;
    clientId: string;
    clientSecret: string;
    scope: string;
    authorizedGrantTypes: string[] | string;
    accessTokenValidity: number;
    refreshTokenValidity: number;
    autoapprove?: string;
    authorities?: string;
    webServerRedirectUri?: string;
};

export type ClientDetail = ClientItem & {
    onlineQuantity?: string;
    captchaFlag?: string;
    encFlag?: string;
};

export type ClientFormState = {
    id: string;
    clientId: string;
    clientSecret: string;
    scope: string;
    authorizedGrantTypes: string[];
    webServerRedirectUri: string;
    authorities: string;
    accessTokenValidity: number;
    refreshTokenValidity: number;
    autoapprove: string;
    onlineQuantity: string;
    captchaFlag: string;
    encFlag: string;
};
