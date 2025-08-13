import { RouterProvider } from 'react-router-dom';
import router from './config/router';
import ApolloProvider from './shared/contexts/ApolloProvider';
import { AppProvider } from './shared/contexts/AppContext';

function App() {
  return (
    <ApolloProvider>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </ApolloProvider>
  );
}

export default App;