// src/services/orderService.js
import { db } from "../firebase";
import { collection, addDoc, doc, onSnapshot, serverTimestamp } from "firebase/firestore";

const ORDERS_COLLECTION = "orders";

/**
 * 1. Crea un nuevo pedido con estado 'pendiente'.
 * Se ejecuta cuando el usuario hace clic en "Comprar".
 */
export const createPendingOrder = async (cartItems, totalAmount) => {
  try {
    const orderData = {
      items: cartItems, // Ej: [{ name: "Entrada", quantity: 1, price: 500 }]
      total: totalAmount,
      status: "pendiente",
      consumed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderData);
    return docRef.id; // Este ID es el que mandaremos a MercadoPago como external_reference
  } catch (error) {
    console.error("Error al crear el pedido en Firestore:", error);
    throw error;
  }
};

/**
 * 2. Escucha los cambios de un pedido en tiempo real.
 * Se usa en la pantalla del usuario para mostrar el QR automáticamente cuando el estado pasa a 'pagado'.
 */
export const subscribeToOrder = (orderId, callback) => {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  
  // onSnapshot se conecta mediante WebSockets. Si la base de datos cambia, el frontend se entera al instante.
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    }
  });
};