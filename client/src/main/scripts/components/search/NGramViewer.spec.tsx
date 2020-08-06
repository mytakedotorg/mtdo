import { _getSearchTerms } from "./NGramViewer";

test("NGramViewer parses search terms", () => {
  const searchQueries = [
    "Wall, -Wall Street",
    "global warming, climate change",
  ];
  const expectedTerms = [
    ["Wall", "-Wall Street"],
    ["global warming", "climate change"],
  ];

  searchQueries.forEach((q, idx) => {
    const terms = _getSearchTerms(q);
    expect(terms).toEqual(expectedTerms[idx]);
  });
});
