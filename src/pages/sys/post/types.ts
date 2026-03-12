export type PostItem = {
	postId: string;
	postCode: string;
	postName: string;
	postSort: number;
	remark?: string;
	createTime?: string;
};

export type PostDetail = PostItem;

export type PostFormState = PostDetail;
