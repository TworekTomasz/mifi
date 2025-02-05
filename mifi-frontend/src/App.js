import './App.css';
import { Navbar } from './components/Navbar';
import { AppRoutes } from './AppRoutes';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <div className='app-container'>
        <Navbar />
        <div className='main-content'>
          <AppRoutes />
        </div>
      </div>
    </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
