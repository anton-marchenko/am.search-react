import React from 'react';
import useSWR from "swr";
import './App.css';

function App() {
  const {
    data: search,
    error,
    isLoading,
  } = useSWR("https://my-json-server.typicode.com/anton-marchenko/jsons/search", (...args) =>
    fetch(...args).then((res) => res.json())
  );

  // Handles error and loading state
  if (error) return <div className="failed">failed to load</div>;
  if (isLoading) return <div className="Loading">Loading...</div>;

  console.log('xx', search)

  const posts = search.posts.hits.map((post: any) =>
    <li key={post.author}>{post.author}</li>
  );

  return (
    <div className="App">
      <div>
        <ul>{posts}</ul>
      </div>
    </div>
  );
}

export default App;
