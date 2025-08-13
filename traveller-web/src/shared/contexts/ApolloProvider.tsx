import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import type { ReactNode } from 'react';
import apolloClient from '../../config/api/apollo';

interface ApolloProviderProps {
  children: ReactNode;
}

export const ApolloProvider = ({ children }: ApolloProviderProps) => {
  return (
    <BaseApolloProvider client={apolloClient}>
      {children}
    </BaseApolloProvider>
  );
};

export default ApolloProvider;