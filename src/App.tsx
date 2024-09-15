import { createContext, useContext, useEffect, useState } from "react";
import "./App.css";
import {
  BlogDto,
  FilterAlias,
  FilterHandlerCallback,
  PostDto,
  SearchFilterState,
  SearchResultDto,
} from "./search/search.model";
import { interceptData } from "./search/intercept-data";
import {
  isEmptyResult,
  isSingleResult,
  showAllResultsButton,
} from "./search/search.utils";

/** максимум элементов в каждой категории */
const DEFAULT_SEARCH_LIMIT = 3;

const SEARCH_API =
  "https://my-json-server.typicode.com/anton-marchenko/jsons/search";

const resolveFilterParams = (
  searchFilter: string
): {
  [key: string]: number;
} => {
  const defaultValue = {
    postsLimit: DEFAULT_SEARCH_LIMIT,
    blogsLimit: DEFAULT_SEARCH_LIMIT,
  };

  if (!searchFilter) {
    return defaultValue;
  }

  return {
    postsLimit: 0,
    blogsLimit: 0,
    [searchFilter + "Limit"]: DEFAULT_SEARCH_LIMIT,
  };
};

const FilterContext = createContext<FilterHandlerCallback>(() => {
  console.error("FilterContext not implemented");
});

function useFetchWithState(searchQuery: string, searchFilter: FilterAlias) {
  const [data, setData] = useState<SearchFilterState>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const updateDataState = (result: SearchResultDto | null) => {
    setData({
      ...data,
      [searchFilter]: result,
    });
  };

  const fetchData = async (sQuery: string) => {
    const queryParams = {
      search: sQuery,
      ...resolveFilterParams(searchFilter),
    };
    const queryParamsString = Object.entries(queryParams)
      .map(([k, v]) => k + "=" + v)
      .join("&");
    // setLoading(true);

    try {
      console.log(searchFilter);
      const response = await fetch(SEARCH_API + "?" + queryParamsString); // Укажите URL вашего API
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data: SearchResultDto = await response.json();

      const resolvedData = interceptData({
        result: data,
        searchFilter,
        searchQuery,
      });

      updateDataState(resolvedData);
    } catch (err: any) {
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const throttledFetch = (() => {
    let lastCall = 0;
    return (filter: string) => {
      const now = Date.now();
      if (now - lastCall >= 2000) {
        lastCall = now;
        fetchData(filter);
      }
    };
  })();

  useEffect(() => {
    setError(null);

    if (searchQuery.length < 3) {
      updateDataState(null);

      return;
    }

    throttledFetch(searchQuery);
  }, [searchQuery, searchFilter]);

  return {
    data,
    isLoading: loading,
    isError: !!error,
  };
}

const SearchInput = ({ onChange }: { onChange: (val: string) => void }) => {
  // const [value, setValue] = useState("");
  return (
    <input
      type="text"
      placeholder="Search..."
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

const MoreButton = ({ total, hitsLength, handleClick }: any) => {
  if (total <= hitsLength) {
    return <></>;
  }

  return (
    <button type="button" onClick={handleClick}>
      Показать {total < 99 ? total : "99+"}
    </button>
  );
};

const PostsContent = ({ total, hits }: { total: number; hits: PostDto[] }) => {
  const handleClick = useContext(FilterContext);

  if (!hits.length) {
    return <></>;
  }

  const items = hits.map((item) => (
    <li key={item.id}>
      {item.author} - <small>{item.text}</small>
    </li>
  ));

  return (
    <div>
      <div>
        Posts{" "}
        <MoreButton
          total={total}
          hitsLength={hits.length}
          handleClick={() => handleClick("posts")}
        ></MoreButton>
      </div>
      <ul>{items}</ul>
    </div>
  );
};

const BlogsContent = ({ total, hits }: { total: number; hits: BlogDto[] }) => {
  const handleClick = useContext(FilterContext);

  if (!hits.length) {
    return <></>;
  }

  const items = hits.map((item) => (
    <li key={item.id}>
      {item.title} - <small>{item.description}</small>
    </li>
  ));

  return (
    <div>
      <div>
        Blogs{" "}
        <MoreButton
          total={total}
          hitsLength={hits.length}
          handleClick={() => handleClick("blogs")}
        ></MoreButton>
      </div>
      <ul>{items}</ul>
      <hr />
    </div>
  );
};

const AllResultsButton = ({ result }: { result: SearchResultDto }) => {
  if (showAllResultsButton(result) === false) {
    return <></>;
  }

  return (
    <>
      <hr />
      <button>Показать все результаты</button>
    </>
  );
};

const FilterTab = ({
  title,
  isActive,
  handleClick,
}: {
  title: string;
  isActive: boolean;
  handleClick: () => void;
}) => {
  const titleWithActive = isActive ? "=" + title + "=" : title;

  return <button onClick={handleClick}>{titleWithActive}</button>;
};

// TODO - если пришла только 1 категория то не показываем фильтры
const FilterToolbar = ({
  allTabResult,
  searchFilter,
}: {
  allTabResult: SearchResultDto;
  searchFilter: FilterAlias;
}) => {
  const handleClick = useContext(FilterContext);

  /**
   * Если результат поиска лишь по одной категории,
   * То скрываем фильтры
   */
  if (isSingleResult(allTabResult)) {
    return <></>;
  }

  const showTabIfNeeded = (
    total: number,
    title: string,
    alias: FilterAlias
  ) => {
    if (total <= 3) {
      return <></>;
    }

    return (
      <FilterTab
        title={title}
        isActive={searchFilter === alias}
        handleClick={() => handleClick(alias)}
      ></FilterTab>
    );
  };

  return (
    <div>
      <hr />
      <FilterTab
        title="All"
        isActive={searchFilter === "all"}
        handleClick={() => handleClick("all")}
      ></FilterTab>
      {showTabIfNeeded(allTabResult.blogs.total, "Blogs", "blogs")}
      {showTabIfNeeded(allTabResult.posts.total, "Posts", "posts")}
      <hr />
    </div>
  );
};

const DropdownContent = ({
  isError,
  isLoading,
  searchFilter,
  searchFilterState,
}: {
  isError: boolean;
  isLoading: boolean;
  searchFilter: FilterAlias;
  searchFilterState: SearchFilterState;
}) => {
  if (isLoading) return <div className="Loading">Loading...</div>;
  if (isError) return <div className="Error">Error!</div>;
  if (!searchFilterState.all) return <></>;
  if (isEmptyResult(searchFilterState.all)) return <div>Ничего не найдено</div>;

  const result = searchFilterState[searchFilter];

  if (!result) return <div className="Loading">Loading...</div>;

  const allTabResult = searchFilterState.all;

  return (
    <>
      <FilterToolbar
        searchFilter={searchFilter}
        allTabResult={allTabResult}
      ></FilterToolbar>
      <BlogsContent
        total={result.blogs.total}
        hits={result.blogs.hits}
      ></BlogsContent>
      <PostsContent
        total={result.posts.total}
        hits={result.posts.hits}
      ></PostsContent>
      <AllResultsButton result={result}></AllResultsButton>
    </>
  );
};

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<FilterAlias>("all");
  const { data, isLoading, isError } = useFetchWithState(
    searchQuery,
    searchFilter
  );

  useEffect(() => {
    // если чтото вбили в поиск то сбрасываем фильтры
    setSearchFilter("all");
  }, [searchQuery]);

  const filterHandler: FilterHandlerCallback = (alias) => {
    setSearchFilter(alias);
  };

  return (
    <FilterContext.Provider value={filterHandler}>
      <div className="App">
        <div>
          <div>
            <SearchInput onChange={(value) => setSearchQuery(value)} />
          </div>
          <DropdownContent
            isError={isError}
            isLoading={isLoading}
            searchFilterState={data}
            searchFilter={searchFilter}
          />
        </div>
      </div>
    </FilterContext.Provider>
  );
}

export default App;
