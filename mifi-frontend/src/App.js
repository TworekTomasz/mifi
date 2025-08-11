import './App.css';
import { Navbar } from './components/Navbar';
import { AppRoutes } from './AppRoutes';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';

const queryClient = new QueryClient();

const AppContent = () => {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Navbar />
      <main className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${
        isCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <AppRoutes />
      </main>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
