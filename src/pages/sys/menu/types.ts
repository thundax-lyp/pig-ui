export type MenuNode = {
	id: string;
	menuId?: string;
	parentId?: string;
	name: string;
	enName?: string;
	path?: string;
	permission?: string;
	sortOrder?: number;
	menuType: '0' | '1' | '2';
	icon?: string;
	keepAlive?: '0' | '1';
	visible?: '0' | '1';
	embedded?: '0' | '1';
	meta?: {
		icon?: string;
		isKeepAlive?: boolean;
	};
	children?: MenuNode[];
};

export type MenuDetail = {
	menuId: string;
	parentId: string;
	name: string;
	enName: string;
	path: string;
	permission: string;
	sortOrder: number;
	menuType: '0' | '1';
	icon: string;
	keepAlive: '0' | '1';
	visible: '0' | '1';
	embedded: '0' | '1';
};

export type MenuFormState = MenuDetail;
