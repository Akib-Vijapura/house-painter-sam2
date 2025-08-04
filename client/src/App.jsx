import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './pages/HomePage';
import GenerateMasksPage from './pages/GenerateMasksPage';
import MaskEditorPage from './pages/MaskEditorPage';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/generate-masks" element={<GenerateMasksPage />} />
          <Route path="/edit-masks" element={<MaskEditorPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;