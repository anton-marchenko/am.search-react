export type FilterAlias = "all" | "blogs" | "posts";

export type BlogDto = {
  id: number;
  description: string;
  title: string;
  url: string;
};

export type PostDto = {
  id: number;
  author: string;
  text: string;
  url: string;
};

export type SearchResultDto = {
  posts: { total: number; hits: PostDto[] };
  blogs: { total: number; hits: BlogDto[] };
};

export type SearchFilterState = {
  all?: SearchResultDto | null;
  posts?: SearchResultDto | null;
  blogs?: SearchResultDto | null;
};

export type FilterHandlerCallback = (alias: FilterAlias) => void;