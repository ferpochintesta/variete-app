// src/pages/Evento.jsx
import React from 'react';

export default function Evento() {
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Información del <span>Evento</span></h2>

      <div style={cardStyle}>
        
        {/* Módulo: Grilla / Horarios */}
        <details style={detailsStyle} open>
          <summary style={summaryStyle}>🎪 Grilla y Horarios</summary>
          <div style={detailsContentStyle}>
            <p style={textStyle}><strong>20:00 -</strong> Apertura de puertas, música de sala y barra habilitada.</p>
            <p style={textStyle}><strong>21:00 -</strong> Inicio de la Varieté - Bloque 1 (Teatro y Clown).</p>
            <p style={textStyle}><strong>22:15 -</strong> Intervalo (Ideal para ir a la barra con tus QRs).</p>
            <p style={textStyle}><strong>22:45 -</strong> Bloque 2 (Música, performances y cierre).</p>
          </div>
        </details>

        {/* Módulo: Artistas */}
        <details style={detailsStyle}>
          <summary style={summaryStyle}>🎨 Artistas en Escena</summary>
          <div style={detailsContentStyle}>
            <p style={textStyle}>Próximamente anunciaremos el line-up completo de los artistas independientes, magos, músicos y actores que formarán parte de esta edición.</p>
          </div>
        </details>

        {/* Módulo: Ubicación */}
        <details style={detailsStyle}>
          <summary style={summaryStyle}>📍 Ubicación y Accesos</summary>
          <div style={detailsContentStyle}>
            <p style={textStyle}><strong>Espacio Cultural Varieté</strong></p>
            <p style={textStyle}>Montevideo, Uruguay</p>
            <p style={{...textStyle, fontSize: '14px', color: '#aaa', marginTop: '10px'}}>
              Al ingresar con tu QR, el staff te indicará tu sector asignado.
            </p>
          </div>
        </details>

        {/* Módulo: Datos Útiles */}
        <details style={detailsStyle}>
          <summary style={summaryStyle}>ℹ️ Datos Importantes</summary>
          <div style={detailsContentStyle}>
            <p style={textStyle}>• Podés comprar tus consumiciones por adelantado o durante el show desde la sección "Consumición" para evitar filas en la caja.</p>
            <p style={textStyle}>• Recordá tener los QRs listos en la pantalla de tu celular al llegar a la entrada y a la barra.</p>
            <p style={textStyle}>• El evento comenzará puntual.</p>
          </div>
        </details>

      </div>
    </div>
  );
}

// Estilos alineados con la estética general de la app
const containerStyle = { padding: '40px 20px', maxWidth: '600px', margin: '0 auto', color: '#f5f5f5', fontFamily: 'sans-serif', textAlign: 'center' };
const titleStyle = { fontSize: '32px', marginBottom: '30px' };
const cardStyle = { background: '#1a1a1a', padding: '20px', borderRadius: '15px', border: '1px solid #333', textAlign: 'left' };

const detailsStyle = { marginBottom: '15px', background: '#000', borderRadius: '8px', border: '1px solid #333', overflow: 'hidden' };
const summaryStyle = { padding: '15px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', outline: 'none', background: '#222', userSelect: 'none' };
const detailsContentStyle = { padding: '15px', borderTop: '1px solid #222' };
const textStyle = { margin: '5px 0', color: '#daffde', lineHeight: '1.5', fontSize: '16px' };