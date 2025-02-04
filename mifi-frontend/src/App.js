import './App.css';
import { Navbar } from './components/Navbar';
import { AppRoutes } from './AppRoutes';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className='app-container'>
        <Navbar />
        <div className='main-content'>
          <AppRoutes />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
