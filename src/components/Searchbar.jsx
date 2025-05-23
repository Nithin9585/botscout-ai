"use client";
import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ repoData, setReposData, setRepos, repo }) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim() === "") {
      // Reset to full list if query empty
      setReposData ? setReposData(repo) : setRepos(repo);
      return;
    }
    const filtered = repo.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    if (setReposData) setReposData(filtered);
    else setRepos(filtered);
  };

  return (
    <div className="flex items-center w-full max-w-xl bg-[#2e2b3f] text-slate-200 rounded-full px-4 py-3 shadow-md focus-within:ring-2 focus-within:ring-purple-500 transition-all duration-200 mx-auto mt-10 md:mt-20">
      <input
        type="text"
        className="flex-grow bg-transparent text-slate-100 placeholder-purple-200/70 outline-none text-sm sm:text-base"
        placeholder="Search GitHub, ArXiv, Hugging Face..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault(); // Prevent submit on Enter
        }}
      />
      <button
        onClick={handleSearch}
        className="ml-3 p-2 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
        aria-label="Search"
      >
        <Search className="text-white" size={20} />
      </button>
    </div>
  );
}
