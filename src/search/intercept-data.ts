import { SearchResultDto } from "./search.model";
import { getEmptyResult } from "./search.utils";

/**
 * Вместо бека тут данные обрабатываем
 * test - blogs/posts
 * tes - empty
 * test1 - 2 blogs
 * test2 - 2 posts
 */
export const interceptData = ({
  result,
  searchFilter,
  searchQuery,
}: {
  result: SearchResultDto;
  searchQuery: string;
  searchFilter: string;
}): SearchResultDto => {
  if (searchQuery === "tes") {
    return getEmptyResult();
  }

  if (searchQuery === "test1") {
    return {
      blogs: {
        total: 2,
        hits: [result.blogs.hits[0], result.blogs.hits[1]],
      },
      posts: {
        total: 0,
        hits: [],
      },
    };
  }

  if (searchQuery === "test2") {
    return {
      posts: {
        total: 2,
        hits: [result.posts.hits[0], result.posts.hits[1]],
      },
      blogs: {
        total: 0,
        hits: [],
      },
    };
  }

  if (searchFilter === "blogs") {
    return {
      blogs: {
        total: 2,
        hits: [...result.blogs.hits],
      },
      posts: {
        total: 0,
        hits: [],
      },
    };
  }

  if (searchFilter === "posts") {
    return {
      posts: {
        total: 2,
        hits: [...result.posts.hits],
      },
      blogs: {
        total: 0,
        hits: [],
      },
    };
  }

  return result;
};
