import debounce from "lodash.debounce";
import { useCallback, useMemo, useState } from "react";

interface UseSearchFilterOptions {
  debounceTime?: number;
  onQueryChange?: (query: string) => void;
}

export function useSearchFilter({ debounceTime = 500, onQueryChange }: UseSearchFilterOptions = {}) {
  const [searchBarText, setSearchBarText] = useState("");
  const [query, setQuery] = useState("");

  const lookup = useCallback(
    (q: string) => {
      setQuery(q);
      onQueryChange?.(q);
    },
    [onQueryChange],
  );

  const debouncedLookup = useMemo(() => debounce(lookup, debounceTime), [lookup, debounceTime]);

  const handleSearchChange = (text: string) => {
    setSearchBarText(text);
    debouncedLookup(text);
  };

  return {
    searchBarText,
    query,
    handleSearchChange,
    setSearchBarText,
    setQuery,
  };
}
