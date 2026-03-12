export type RoleItem = {
	roleId: string;
	roleName: string;
	roleCode: string;
	roleDesc?: string;
	createTime?: string;
};

export type MenuTreeNode = {
	id: string;
	name: string;
	children?: MenuTreeNode[];
};

export type RoleFormState = {
	roleId: string;
	roleName: string;
	roleCode: string;
	roleDesc: string;
};
