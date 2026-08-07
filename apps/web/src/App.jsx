import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Profil from './pages/Profil';
import Home from './pages/Home';
import Artisans from './pages/Artisans';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inscription" element={<Register />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/artisans" element={<Artisans />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;