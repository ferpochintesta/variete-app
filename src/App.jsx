// src/App.jsx
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Tickets from './pages/Tickets';
import Consumicion from './pages/Consumicion';
import Evento from './pages/Evento';
import Success from './pages/Success'; 
import Staff from './pages/Staff';  

// Creamos el componente del botón directamente en este archivo
const BotonVolver = () => {
  const location = useLocation();

  // Si estamos en la página de inicio ("/"), devolvemos null (no muestra nada)
  if (location.pathname === '/') {
    return null;
  }

  return (
    <div style={{ textAlign: 'center', padding: '30px 20px', marginTop: 'auto' }}>
      <Link 
        to="/" 
        style={{ 
          color: '#deff9a', 
          textDecoration: 'underline', 
          fontSize: '16px',
          fontFamily: 'sans-serif'
        }}
      >
        ← Volver al inicio
      </Link>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      {/* Contenedor Flexbox: hace que el contenido ocupe toda la pantalla y empuja el botón abajo */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* Tus rutas */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/evento" element={<Evento />} />
          <Route path="/entradas" element={<Tickets />} />
          <Route path="/consumicion" element={<Consumicion />} />
          <Route path="/success" element={<Success />} /> 
          <Route path="/staff" element={<Staff />} />     
        </Routes>

        {/* El botón siempre al fondo (adentro del BrowserRouter) */}
        <BotonVolver />
        
      </div>
    </BrowserRouter>
  );
}

export default App;