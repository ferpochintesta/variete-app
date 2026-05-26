// src/pages/Tickets.jsx
import React, { useState, useEffect } from 'react';
import { catalog } from '../data/catalog';
import { createPendingOrder, subscribeToOrder } from '../services/orderService';
import { QRCodeCanvas } from 'qrcode.react'; // Cambiado a QRCodeCanvas para mejor renderizado
import axios from 'axios';

export default function Tickets() {
  const [selectedTicket, setSelectedTicket] = useState(catalog.entradas[0]);
  const [qty, setQty] = useState(1);
  const [names, setNames] = useState(['']); // Array para los nombres de los asistentes
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null); // 'pendiente' o 'pagado'
  const [loading, setLoading] = useState(false);

  // Cada vez que cambia la cantidad, ajustamos el tamaño del array de nombres
  const handleQtyChange = (newQty) => {
    const val = parseInt(newQty);
    if (val < 1) return;
    setQty(val);
    // Preservamos los nombres ya escritos y agregamos vacíos si aumenta la cantidad
    const newNames = [...names];
    if (val > names.length) {
      for (let i = names.length; i < val; i++) newNames.push('');
    } else {
      newNames.length = val;
    }
    setNames(newNames);
  };

  const handleNameChange = (index, value) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const handleBuy = async () => {
    // Validación: Todos los nombres deben estar completos
    if (names.some(n => n.trim() === '')) {
      alert("Por favor, ingresá el nombre de todos los asistentes.");
      return;
    }

    setLoading(true);
    try {
      const total = selectedTicket.price * qty;
      const items = [{
        id: selectedTicket.id,
        name: selectedTicket.name,
        quantity: qty,
        price: selectedTicket.price,
        asistentes: names // Guardamos los nombres en el item
      }];

      // 1. Creamos la orden "pendiente" en Firestore
      const id = await createPendingOrder(items, total);
      setOrderId(id);

      // 2. Llamamos a nuestra función de backend (Vercel) para MercadoPago
      // Nota: Reemplazar por tu URL real una vez desplegado el backend
      const response = await axios.post('/api/create-preference', {
        orderId: id,
        items: items,
        total: total
      });

      // 3. Redirigimos al Checkout Pro de MercadoPago
      window.location.href = response.data.init_point;

    } catch (error) {
      console.error("Error en el proceso de compra:", error);
      alert("Hubo un error al procesar la compra. Intentá de nuevo.");
      setLoading(false);
    }
  };

  // Escuchamos cambios en la orden si ya tenemos un ID
  useEffect(() => {
    if (orderId) {
      const unsubscribe = subscribeToOrder(orderId, (orderData) => {
        setOrderStatus(orderData.status);
      });
      return () => unsubscribe();
    }
  }, [orderId]);

  if (orderStatus === 'pagado') {
    return (
      <div style={containerStyle}>
        <h2 style={{color: '#deff9a'}}>¡Pago Confirmado! 🎪</h2>
        <p>Tu entrada para la Varieté ya es válida. Mostrá este QR al ingresar:</p>
        <div style={{background: '#fff', padding: '20px', borderRadius: '10px', marginTop: '20px'}}>
          <QRCodeCanvas value={orderId} size={256} />
        </div>
        <p style={{marginTop: '20px', fontSize: '14px'}}>ID de Pedido: {orderId}</p>
        <button onClick={() => window.print()} style={buttonStyle}>Imprimir / Guardar PDF</button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Comprar <span>Entradas</span></h2>
      
      <div style={cardStyle}>
        <label>Tipo de Entrada:</label>
        <select 
          value={selectedTicket.id} 
          onChange={(e) => setSelectedTicket(catalog.entradas.find(t => t.id === e.target.value))}
          style={inputStyle}
        >
          {catalog.entradas.map(t => <option key={t.id} value={t.id}>{t.name} - ${t.price}</option>)}
        </select>

        <label style={{marginTop: '20px', display: 'block'}}>Cantidad:</label>
        <input 
          type="number" 
          value={qty} 
          onChange={(e) => handleQtyChange(e.target.value)} 
          style={inputStyle}
        />

        <div style={{marginTop: '30px'}}>
          <p style={{fontWeight: 'bold', marginBottom: '10px'}}>Nombres de los asistentes:</p>
          {names.map((name, i) => (
            <input 
              key={i}
              type="text"
              placeholder={`Nombre Asistente ${i + 1}`}
              value={name}
              onChange={(e) => handleNameChange(i, e.target.value)}
              style={{...inputStyle, marginBottom: '10px'}}
            />
          ))}
        </div>

        <div style={{marginTop: '30px', borderTop: '1px solid #444', paddingTop: '20px'}}>
          <h3 style={{margin: 0}}>Total: ${selectedTicket.price * qty}</h3>
          <button 
            onClick={handleBuy} 
            disabled={loading}
            style={{...buttonStyle, opacity: loading ? 0.5 : 1, marginTop: '20px'}}
          >
            {loading ? 'Procesando...' : 'Pagar con MercadoPago'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Estilos rápidos (puedes pasarlos a CSS)
const containerStyle = { padding: '40px 20px', maxWidth: '600px', margin: '0 auto', color: '#f5f5f5', fontFamily: 'sans-serif' };
const titleStyle = { fontSize: '32px', marginBottom: '30px' };
const cardStyle = { background: '#1a1a1a', padding: '30px', borderRadius: '15px', border: '1px solid #333' };
const inputStyle = { width: '100%', padding: '12px', marginTop: '8px', borderRadius: '8px', border: '1px solid #444', background: '#000', color: '#fff' };
const buttonStyle = { width: '100%', padding: '15px', backgroundColor: '#deff9a', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' };