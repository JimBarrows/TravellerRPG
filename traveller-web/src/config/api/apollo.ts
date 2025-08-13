import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
  Observable,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { env } from '../environment';
import { STORAGE_KEYS } from '../../shared/constants';

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: env.graphqlEndpoint,
});

// Request middleware
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Error handling
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Handle specific error codes
      if (message.includes('Unauthorized') || message.includes('Authentication')) {
        // Clear token and redirect to login
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        window.location.href = '/auth/login';
      }
    });
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    
    // Handle network errors
    if ('statusCode' in networkError) {
      switch (networkError.statusCode) {
        case 401:
          // Unauthorized - clear token and redirect
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          window.location.href = '/auth/login';
          break;
        case 500:
          // Server error
          console.error('Server error occurred');
          break;
        default:
          break;
      }
    }
  }
});

// Retry link for failed requests
const retryLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const retry = (error?: any) => {
      if (retryCount >= maxRetries) {
        if (error) {
          observer.error(error);
        }
        return;
      }
      
      retryCount++;
      
      const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
      
      setTimeout(() => {
        forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: retry,
          complete: observer.complete.bind(observer),
        });
      }, delay);
    };
    
    forward(operation).subscribe({
      next: observer.next.bind(observer),
      error: retry,
      complete: observer.complete.bind(observer),
    });
  });
});

// Cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Pagination handling for characters
        characters: {
          keyArgs: ['filter', 'sort'],
          merge(existing = { items: [] }, incoming) {
            return {
              ...incoming,
              items: [...existing.items, ...incoming.items],
            };
          },
        },
        // Pagination handling for campaigns
        campaigns: {
          keyArgs: ['filter', 'sort'],
          merge(existing = { items: [] }, incoming) {
            return {
              ...incoming,
              items: [...existing.items, ...incoming.items],
            };
          },
        },
      },
    },
    Character: {
      keyFields: ['id'],
    },
    Campaign: {
      keyFields: ['id'],
    },
    User: {
      keyFields: ['id'],
    },
  },
});

// Apollo Client instance
export const apolloClient = new ApolloClient({
  link: ApolloLink.from([
    errorLink,
    authLink,
    retryLink,
    httpLink,
  ]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Helper function to clear Apollo cache
export const clearApolloCache = async () => {
  await apolloClient.clearStore();
};

// Helper function to reset Apollo cache
export const resetApolloCache = async () => {
  await apolloClient.resetStore();
};

export default apolloClient;