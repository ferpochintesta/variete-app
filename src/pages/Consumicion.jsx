// src/pages/Consumicion.jsx
import React, { useState, useEffect } from 'react';
import { createPendingOrder, subscribeToOrder } from '../services/orderService';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';

// 1. Nuevos imports para conectar con tu Firebase
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; // Asegurate de que esta ruta a tu archivo firebase.js sea correcta

export default function Consumicion() {
  const [cart, setCart] = useState({});
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2. Nuevo estado que alojará el menú en tiempo real
  const [menu, setMenu] = useState({ bebidas: [], comidas: [] });

  // 3. Efecto para escuchar la base de datos ni bien entra el cliente
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'productosBarra'), (snapshot) => {
      let bebidasList = [];
      let comidasList = [];

      snapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() };
        if (item.categoria === 'comida') {
          comidasList.push(item);
        } else {
          bebidasList.push(item);
        }
      });

      // Ordenamos alfabéticamente para que el menú se vea prolijo
      bebidasList.sort((a, b) => a.name.localeCompare(b.name));
      comidasList.sort((a, b) => a.name.localeCompare(b.name));

      setMenu({ bebidas: bebidasList, comidas: comidasList });
    });

    return () => unsubscribe();
  }, []);

  // Función para sumar o restar cantidades
  const updateQty = (item, delta) => {
    setCart(prev => {
      const currentQty = prev[item.id]?.quantity || 0;
      const newQty = currentQty + delta;
      
      // 4. Lógica de control de Stock: Evitamos que agregue más del stock disponible
      if (delta > 0 && item.stock !== null && newQty > item.stock) {
        return prev;
      }
      
      const newCart = { ...prev };
      if (newQty <= 0) {
        delete newCart[item.id]; 
      } else {
        newCart[item.id] = { ...item, quantity: newQty };
      }
      return newCart;
    });
  };

  const totalAmount = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleBuy = async () => {
    if (Object.keys(cart).length === 0) {
      alert("Por favor, selecciona al menos un producto.");
      return;
    }

    setLoading(true);
    try {
      const itemsToBuy = Object.values(cart).map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const id = await createPendingOrder(itemsToBuy, totalAmount);
      setOrderId(id);

      const response = await axios.post('/api/create-preference', {
        orderId: id,
        items: itemsToBuy,
        total: totalAmount
      });

      window.location.href = response.data.init_point;

    } catch (error) {
      console.error("Error al procesar:", error);
      alert("Hubo un error. Intentá nuevamente.");
      setLoading(false);
    }
  };

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
        <h2 style={{color: '#deff9a'}}>¡Barra Lista! 🍻</h2>
        <p>Mostrá este QR en la barra para retirar tu pedido.</p>
        <div style={{background: '#fff', padding: '20px', borderRadius: '10px', marginTop: '20px', display: 'inline-block'}}>
          <QRCodeCanvas value={orderId} size={256} />
        </div>
        
        <div style={{marginTop: '20px', textAlign: 'left', background: '#1a1a1a', padding: '15px', borderRadius: '8px'}}>
          <h3 style={{marginTop: 0}}>Tu Pedido:</h3>
          <ul style={{paddingLeft: '20px', margin: 0}}>
            {Object.values(cart).map(item => (
              <li key={item.id}>{item.quantity}x {item.name}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Componente de fila con lógica de UI para el Stock
  // Componente de fila con lógica de UI para el Stock (SIN mostrar el número)
  const ProductRow = ({ item }) => {
    const qty = cart[item.id]?.quantity || 0;
    
    // Verificamos si se quedó sin stock o si ya alcanzó el máximo permitido
    const isOutOfStock = item.stock !== null && item.stock <= 0;
    const isMaxReached = item.stock !== null && qty >= item.stock;

    return (
      <div style={{ ...productRowStyle, opacity: isOutOfStock ? 0.5 : 1 }}>
        <div>
          <div style={{fontWeight: 'bold', fontSize: '16px', textDecoration: isOutOfStock ? 'line-through' : 'none'}}>
            {item.name}
          </div>
          <div style={{fontSize: '14px', color: '#aaa'}}>
            ${item.price} 
            {/* Solo mostramos texto si está agotado, sino queda limpio */}
            {isOutOfStock && (
               <span style={{ color: '#ff4d4d', marginLeft: '8px', fontWeight: 'bold' }}>
                 (Agotado)
               </span>
            )}
          </div>
        </div>
        <div style={qtyControlStyle}>
          <button onClick={() => updateQty(item, -1)} style={qtyBtnStyle} disabled={qty === 0}>-</button>
          <span style={{width: '30px', textAlign: 'center'}}>{qty}</span>
          <button 
            onClick={() => updateQty(item, 1)} 
            style={{ ...qtyBtnStyle, backgroundColor: (isOutOfStock || isMaxReached) ? '#555' : '#333' }}
            disabled={isOutOfStock || isMaxReached}
          >
            +
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Comprar <span>Consumición</span></h2>
      
      <div style={cardStyle}>
        
        <details style={detailsStyle} open>
          <summary style={summaryStyle}>🍹 Bebidas</summary>
          <div style={detailsContentStyle}>
            {menu.bebidas.length === 0 ? (
              <p style={{textAlign: 'center', color: '#666', padding: '10px 0'}}>No hay bebidas cargadas aún.</p>
            ) : (
              menu.bebidas.map(item => <ProductRow key={item.id} item={item} />)
            )}
          </div>
        </details>

        <details style={detailsStyle}>
          <summary style={summaryStyle}>🍕 Comida</summary>
          <div style={detailsContentStyle}>
            {menu.comidas.length === 0 ? (
              <p style={{textAlign: 'center', color: '#666', padding: '10px 0'}}>No hay comidas cargadas aún.</p>
            ) : (
              menu.comidas.map(item => <ProductRow key={item.id} item={item} />)
            )}
          </div>
        </details>

        <div style={checkoutSectionStyle}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h3 style={{margin: 0, color: '#aaa'}}>Total a pagar:</h3>
            <h2 style={{margin: 0, color: '#deff9a'}}>${totalAmount}</h2>
          </div>
          
          <button 
            onClick={handleBuy} 
            disabled={loading || totalAmount === 0}
            style={{
              ...buttonStyle, 
              opacity: (loading || totalAmount === 0) ? 0.5 : 1,
              cursor: (loading || totalAmount === 0) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Procesando...' : `Pagar $${totalAmount} con MercadoPago`}
          </button>
        </div>

      </div>
    </div>
  );
}

// Estilos
const containerStyle = { padding: '40px 20px', maxWidth: '600px', margin: '0 auto', color: '#f5f5f5', fontFamily: 'sans-serif', textAlign: 'center' };
const titleStyle = { fontSize: '32px', marginBottom: '30px' };
const cardStyle = { background: '#1a1a1a', padding: '20px', borderRadius: '15px', border: '1px solid #333', textAlign: 'left' };

const detailsStyle = { marginBottom: '15px', background: '#000', borderRadius: '8px', border: '1px solid #333', overflow: 'hidden' };
const summaryStyle = { padding: '15px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', outline: 'none', userSelect: 'none', background: '#222' };
const detailsContentStyle = { padding: '0 15px' };

const productRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #333' };
const qtyControlStyle = { display: 'flex', alignItems: 'center', gap: '10px', background: '#222', borderRadius: '20px', padding: '5px' };
const qtyBtnStyle = { width: '30px', height: '30px', borderRadius: '50%', border: 'none', background: '#333', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' };

const checkoutSectionStyle = { marginTop: '30px', borderTop: '1px solid #444', paddingTop: '20px' };
const buttonStyle = { width: '100%', padding: '15px', backgroundColor: '#deff9a', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' };