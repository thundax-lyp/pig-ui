export type PasswordLoginPayload = {
    username: string;
    password: string;
    code?: string;
    randomStr?: string;
    grant_type?: 'password';
    scope?: 'server';
};

export type MobileLoginPayload = {
    mobile: string;
    code: string;
};

export type RegisterPayload = {
    username: string;
    password: string;
    phone: string;
};

export type OAuthTokenResponse = {
    access_token: string;
    refresh_token: string;
    token_type?: string;
    expires_in?: number;
    scope?: string;
    license?: string;
};

export type CurrentUserInfo = {
    userId: string;
    username: string;
    name: string;
    avatar?: string;
    dept?: {
        deptId: string;
        name: string;
    };
    roleList?: Array<{
        roleId: string;
        roleName: string;
    }>;
    postList?: Array<{
        postId: string;
        postName: string;
    }>;
    permissions?: string[];
};
