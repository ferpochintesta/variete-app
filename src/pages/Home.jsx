// src/pages/Home.jsx
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Varieté "La Varieté"</h1>
      <p>Bienvenido. ¿Qué querés hacer?</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
        
        {/* Botón Módulo 1 */}
        <Link to="/evento" style={buttonStyle}>
          📅 Información del Evento
        </Link>

        {/* Botón Módulo 2 */}
        <Link to="/entradas" style={buttonStyle}>
          🎟️ Comprar Entradas
        </Link>

        {/* Botón Módulo 3 */}
        <Link to="/consumicion" style={buttonStyle}>
          🍻 Comprar Consumición
        </Link>

      </div>
    </div>
  );
}

// Estilos simples para los botones
const buttonStyle = {
  padding: '15px',
  backgroundColor: '#333',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '8px',
  fontSize: '18px',
  fontWeight: 'bold'
};