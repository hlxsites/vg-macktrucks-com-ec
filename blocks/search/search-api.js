const SEARCH_URLS = {
  prod: 'https://kb3ko4nzt2.execute-api.eu-west-1.amazonaws.com/prod/search',
  dev: 'https://search-api-dev.aws.43636.vnonprod.com/search',
};

const isProd = !window.location.host.includes('hlx.page') && !window.location.host.includes('localhost');
const SEARCH_LINK = !isProd ? SEARCH_URLS.dev : SEARCH_URLS.prod;

export async function fetchData(queryObj) {
  const response = await fetch(
    SEARCH_LINK,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': queryObj.length,
      },
      body: JSON.stringify(queryObj),
    },
  );

  return response.json();
}

export const searchQuery = (hasFilters) => `
query MacTrucksQuery($q: String, $offset: Int, $limit: Int, $language: MackLocaleEnum!,
$facets: [MackFacet], $sort: [MackSortOptionsEnum]${hasFilters ? ', $filters: [MackFilterItem]' : ''}) {
  macktrucksearch(q: $q, offset: $offset, limit: $limit, language: $language,
  facets: $facets, sort: $sort${hasFilters ? ', filters: $filters' : ''}) {
    count
    items {
      uuid
      score
      metadata {
        title
        description
        url
        lastModified
      }
    }
    facets {
      field
      items {
        value
        count
      }
    }
  }
}
`;

export const autosuggestQuery = () => `query Macktrucksuggest($term: String!, $locale: MackLocaleEnum!, $sizeSuggestions: Int) {
  macktrucksuggest(term: $term, locale: $locale, sizeSuggestions: $sizeSuggestions) {
    terms
  }
}`;
