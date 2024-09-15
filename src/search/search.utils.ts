import { SearchResultDto } from "./search.model";

export const getEmptyResult = (): SearchResultDto => ({
  posts: { total: 0, hits: [] },
  blogs: { total: 0, hits: [] },
});

/**
 * Результат найден лишь в одной из категорий
 */
export const isSingleResult = (result: SearchResultDto): boolean => {
  const notEmptyResultsQty = [
    result.blogs.hits.length,
    result.posts.hits.length,
  ].filter((value) => value > 0).length;

  return notEmptyResultsQty === 1;
};

export const isEmptyResult = (result: SearchResultDto): boolean => {
  if (!result) {
    return true;
  }

  return [result.blogs.hits.length, result.posts.hits.length].every(
    (value) => value === 0
  );
};

/**
 * Показываем кнопку "Показать все результаты"
 * только когда хотя бы по одной из категорий total > 3
 * (то есть есть на серваке те данные который пользак не видит в выдаче,
 * ведь у выдачи лимит - всего 3 элемента в каждой из категорий)
 */
export const showAllResultsButton = (result: SearchResultDto): boolean => {
  return [result.blogs.total, result.posts.total].some((value) => value > 3);
};
