// src/pages/Staff.jsx
import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function Staff() {
  const [scannedId, setScannedId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Inicializamos el escáner nativo de la cámara
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      (decodedText) => {
        // Cuando lee un QR con éxito, frena el escáner y procesa el ID
        scanner.clear();
        handleLookup(decodedText);
      },
      (error) => { /* Silenciar errores de lectura continuos */ }
    );

    return () => scanner.clear();
  }, []);

  const handleLookup = async (id) => {
    setScannedId(id);
    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const docRef = doc(db, 'orders', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setOrderData(docSnap.data());
      } else {
        setError('❌ Código inválido. Este pedido no existe.');
      }
    } catch (err) {
      console.error(err);
      setError('Error al conectar con la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  const markAsConsumed = async () => {
    if (!scannedId) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'orders', scannedId);
      await updateDoc(docRef, { consumed: true, consumedAt: new Date() });
      
      // Actualizamos la visualización local
      setOrderData(prev => ({ ...prev, consumed: true }));
      alert("¡Registrado con éxito!");
    } catch (err) {
      alert("Error al actualizar la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2>🔒 Control de <span>Staff</span></h2>
      <p style={{ color: '#aaa' }}>Escaneá el código QR del cliente para validar accesos o consumiciones.</p>

      {/* Cuadrante donde se activará la cámara */}
      <div id="reader" style={{ background: '#1a1a1a', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}></div>

      {loading && <p>Buscando datos del pedido...</p>}
      {error && <div style={{ color: '#ff8a8a', padding: '15px', background: '#301a1a', borderRadius: '8px', marginTop: '20px' }}>{error}</div>}

      {orderData && (
        <div style={{ ...cardStyle, borderColor: orderData.consumed ? '#ff8a8a' : '#deff9a' }}>
          <h3 style={{ margin: 0, color: orderData.consumed ? '#ff8a8a' : '#deff9a' }}>
            {orderData.consumed ? "🔴 YA UTILIZADO / CONSUMIDO" : "🟢 CÓDIGO VÁLIDO"}
          </h3>
          
          <div style={{ marginTop: '15px', fontSize: '16px', textAlign: 'left' }}>
            <p><strong>Estado del Pago:</strong> {orderData.status?.toUpperCase()}</p>
            <p><strong>Ítems comprados:</strong></p>
            <ul style={{ paddingLeft: '20px' }}>
              {orderData.items.map((item, i) => (
                <li key={i} style={{ marginBottom: '10px' }}>
                  <strong>{item.quantity}x {item.name}</strong>
                  {item.asistentes && (
                    <div style={{ fontSize: '14px', color: '#aaa' }}>
                      Asistentes: {item.asistentes.join(', ')}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <button 
            onClick={markAsConsumed} 
            disabled={orderData.consumed || orderData.status !== 'pagado'}
            style={{
              ...btnStyle,
              backgroundColor: orderData.consumed ? '#444' : '#deff9a',
              cursor: orderData.consumed ? 'not-allowed' : 'pointer'
            }}
          >
            {orderData.consumed ? "Entregado anteriormente" : "Marcar como Entregado / Ingresado"}
          </button>
          
          <button onClick={() => window.location.reload()} style={{ ...btnStyle, backgroundColor: '#333', color: '#fff', marginTop: '10px' }}>
            🔄 Escanear otro código
          </button>
        </div>
      )}
    </div>
  );
}

const containerStyle = { padding: '20px', maxWidth: '500px', margin: '0 auto', color: '#fff', fontFamily: 'sans-serif', textAlign: 'center' };
const cardStyle = { background: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '2px solid', marginTop: '20px' };
const btnStyle = { width: '100%', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', marginTop: '15px', color: '#000' };