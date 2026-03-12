export type UserListItem = {
	userId: string;
	username: string;
	name: string;
	phone?: string;
	email?: string;
	nickname?: string;
	lockFlag: '0' | '9';
	createTime?: string;
	dept?: {
		deptId: string;
		name: string;
	};
	roleList?: Array<{ roleId: string; roleName: string }>;
	postList?: Array<{ postId: string; postName: string }>;
};

export type UserDetails = UserListItem & {
	password?: string;
	deptId?: string;
	role?: string[];
	post?: string[];
};

export type PagedResult<T> = {
	data: {
		records: T[];
		total: number;
	};
};

export type DeptTreeNode = {
	id: string;
	name: string;
	isLock?: boolean;
	children?: DeptTreeNode[];
};

export type RoleOption = {
	roleId: string;
	roleName: string;
};

export type PostOption = {
	postId: string;
	postName: string;
};

export type UserQuery = {
	current: number;
	size: number;
	username?: string;
	phone?: string;
	deptId?: string;
};

export type UserFormState = {
	userId: string;
	username: string;
	password: string;
	name: string;
	phone: string;
	email: string;
	nickname: string;
	lockFlag: '0' | '9';
	deptId: string;
	role: string[];
	post: string[];
};
