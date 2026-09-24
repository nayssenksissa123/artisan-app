import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Profil from './pages/Profil';
import Home from './pages/Home';
import Artisans from './pages/Artisans';
import Demandes from './pages/Demandes';
import Planning from './pages/Planning';
import Categories from './pages/Categories';

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
        <Route path="/categories" element={<Categories />} />
        <Route path="/demandes" element={<Demandes />} />
        <Route path="/planning" element={<Planning />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;