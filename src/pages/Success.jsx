// src/pages/Success.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';

export default function Success() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const orderId = searchParams.get('external_reference');

  useEffect(() => {
    if (!orderId) return;

    const finalizeOrder = async () => {
      try {
        const docRef = doc(db, 'orders', orderId);
        
        // Simulación de Webhook para localhost y entorno de pruebas
        await updateDoc(docRef, { status: 'pagado', updatedAt: new Date() });
        
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder(docSnap.data());
        }
      } catch (error) {
        console.error("Error al procesar la orden exitosa:", error);
      } finally {
        setLoading(false);
      }
    };

    finalizeOrder();
  }, [orderId]);

  const downloadPDF = () => {
    if (!order || !orderId) return;

    // Creamos el PDF en tamaño A6 (ideal para credenciales/tickets en celular)
    const docPDF = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a6' });
    let isFirstPage = true;

    // 1. SECCIÓN DE ENTRADAS: Generamos una página por cada asistente
    const ticketItems = order.items.filter(item => item.id.startsWith('ent'));
    
    let ticketGlobalIndex = 0;
    ticketItems.forEach((item) => {
      const asistentes = item.asistentes || ['Asistente'];
      
      asistentes.forEach((asistente) => {
        if (!isFirstPage) {
          docPDF.addPage({ format: 'a6', orientation: 'portrait' });
        }
        isFirstPage = false;

        // Diseño de la página de la Entrada
        docPDF.setFillColor(26, 26, 26); // Fondo Oscuro
        docPDF.rect(0, 0, 105, 148, 'F');
        
        docPDF.setTextColor(222, 255, 154); // Color Lima
        docPDF.setFontSize(16);
        docPDF.text("VARIETÉ 'LA VARIETÉ'", 10, 20);
        
        docPDF.setTextColor(255, 255, 255);
        docPDF.setFontSize(12);
        docPDF.text(item.name.toUpperCase(), 10, 32);
        
        docPDF.setTextColor(222, 255, 154);
        docPDF.setFontSize(13);
        docPDF.text(`Asistente: ${asistente}`, 10, 45);
        
        docPDF.setTextColor(170, 170, 170);
        docPDF.setFontSize(9);
        docPDF.text(`Código Ticket: ${orderId}-T${ticketGlobalIndex}`, 10, 64);
        docPDF.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 70);
        
        docPDF.setDrawColor(68, 68, 68);
        docPDF.line(10, 76, 95, 76);
        
        // Clonamos el QR específico de este asistente al PDF
        const canvas = document.getElementById(`qr-ticket-${ticketGlobalIndex}`);
        if (canvas) {
          const qrBase64 = canvas.toDataURL('image/png');
          docPDF.addImage(qrBase64, 'PNG', 27, 85, 50, 50);
        }
        
        ticketGlobalIndex++;
      });
    });

    // 2. SECCIÓN DE CONSUMICIONES: Si compró barra, van todas juntas en una sola hoja al final
    const barraItems = order.items.filter(item => !item.id.startsWith('ent'));
    
    if (barraItems.length > 0) {
      if (!isFirstPage) {
        docPDF.addPage({ format: 'a6', orientation: 'portrait' });
      }
      isFirstPage = false;

      // Diseño de la página de la Barra
      docPDF.setFillColor(20, 28, 20); // Fondo sutilmente más verdoso para la barra
      docPDF.rect(0, 0, 105, 148, 'F');
      
      docPDF.setTextColor(222, 255, 154);
      docPDF.setFontSize(16);
      docPDF.text("BARRA VARIETÉ", 10, 20);
      
      docPDF.setTextColor(255, 255, 255);
      docPDF.setFontSize(10);
      docPDF.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 35);
      
      docPDF.setDrawColor(68, 68, 68);
      docPDF.line(10, 42, 95, 42);
      
      docPDF.setTextColor(255, 255, 255);
      docPDF.setFontSize(11);
      docPDF.text("PRODUCTOS A RETIRAR:", 10, 50);
      
      let yPos = 58;
      barraItems.forEach((item) => {
        docPDF.text(`• ${item.quantity}x ${item.name}`, 12, yPos);
        yPos += 8;
      });

      // El QR de la barra usa el ID general de la orden
      const canvasBarra = document.getElementById('qr-barra-general');
      if (canvasBarra) {
        const qrBase64 = canvasBarra.toDataURL('image/png');
        docPDF.addImage(qrBase64, 'PNG', 27, 85, 50, 50);
      }
    }

    // Guardamos el archivo único final
    docPDF.save(`Variete-Ventas-${orderId.substring(0,6)}.pdf`);
  };

  if (loading) return <div style={msgStyle}>🔄 Validando tu pago con Mercado Pago...</div>;
  if (!orderId || !order) return <div style={msgStyle}>⚠️ No se encontró información del pedido.</div>;

  // Separamos los items para dibujarlos ordenados en la pantalla
  const entradasCompradas = order.items.filter(item => item.id.startsWith('ent'));
  const consumicionesCompradas = order.items.filter(item => !item.id.startsWith('ent'));

  // Contador global para renderizar los canvas de los códigos QR correspondientes
  let localTicketCount = 0;

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#deff9a' }}>¡Compra Completada! 🎉</h2>
      <p>Tu pago fue aprobado. A continuación podés ver tus accesos y descargar tu PDF.</p>
      
      <div style={{ margin: '20px 0' }}>
        <button onClick={downloadPDF} style={mainBtnStyle}>📥 Descargar PDF</button>
      </div>

      {/* Visualización de Entradas Individuales */}
      {entradasCompradas.map((item, itemIdx) => {
        const asistentes = item.asistentes || ['Asistente'];
        return asistentes.map((asistente, asisIdx) => {
          const currentCount = localTicketCount;
          localTicketCount++; // Incrementamos para el siguiente
          
          return (
            <div key={`${itemIdx}-${asisIdx}`} style={cardStyle}>
              <h3 style={{ color: '#deff9a', marginTop: 0 }}>🎟️ Entrada para: {asistente}</h3>
              <p style={{ fontSize: '14px', color: '#aaa' }}>{item.name} • Código individual</p>
              
              <div style={qrContainerStyle}>
                {/* Genera un QR único agregando "-T" y el número de ticket */}
                <QRCodeCanvas id={`qr-ticket-${currentCount}`} value={`${orderId}-T${currentCount}`} size={160} />
              </div>
            </div>
          );
        });
      })}

      {/* Visualización de la Barra de Consumiciones */}
      {consumicionesCompradas.length > 0 && (
        <div style={{ ...cardStyle, backgroundColor: '#141c14' }}>
          <h3 style={{ color: '#deff9a', marginTop: 0 }}>🍹 Consumiciones</h3>
          <p style={{ fontSize: '14px', color: '#aaa' }}>Retirá presentando este código en la barra</p>
          
          <div style={{ textAlign: 'left', margin: '15px 0', background: '#000', padding: '10px', borderRadius: '6px' }}>
            {consumicionesCompradas.map((item, i) => (
              <div key={i} style={{ fontSize: '15px', padding: '4px 0' }}>
                • <strong>{item.quantity}x</strong> {item.name}
              </div>
            ))}
          </div>

          <div style={qrContainerStyle}>
            {/* El QR de la barra usa el ID limpio de la orden */}
            <QRCodeCanvas id="qr-barra-general" value={orderId} size={160} />
          </div>
        </div>
      )}

      <Link to="/" style={{ color: '#aaa', display: 'block', marginTop: '30px', textDecoration: 'none' }}>← Volver al Inicio</Link>
    </div>
  );
}

// Estilos visuales de alto nivel
const containerStyle = { padding: '40px 20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif', color: '#fff', textAlign: 'center' };
const cardStyle = { background: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '1px solid #333', marginTop: '20px' };
const qrContainerStyle = { background: '#fff', padding: '12px', borderRadius: '8px', display: 'inline-block', margin: '10px 0' };
const mainBtnStyle = { width: '100%', padding: '16px', backgroundColor: '#deff9a', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(222,255,154,0.3)' };
const msgStyle = { color: '#fff', textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' };