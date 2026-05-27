import { db } from "../firebase";
import { collection, doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

const ORDERS_COLLECTION = "orders";

// 1. Función que genera un número aleatorio de 6 dígitos (ej. "482910")
const generarIdCorto = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createPendingOrder = async (items, total) => {
  try {
    // 2. Usamos nuestro ID de 6 números
    const orderId = generarIdCorto(); 
    
    // 3. setDoc nos permite decirle a Firebase qué ID exacto queremos usar
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    
    const newOrder = {
      items,
      total,
      status: "pendiente",
      createdAt: serverTimestamp(),
    };

    await setDoc(docRef, newOrder);
    return orderId;
  } catch (error) {
    console.error("Error creating order: ", error);
    throw error;
  }
};

export const subscribeToOrder = (orderId, callback) => {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    }
  });
};