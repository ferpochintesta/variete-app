import { db } from "../firebase";
import { collection, doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

const ORDERS_COLLECTION = "orders";

// 1. Generador para Barra (Empieza del 1 al 6)
const generarIdBarra = () => {
  const primero = Math.floor(Math.random() * 6) + 1; // 1 a 6
  const resto = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${primero}${resto}`;
};

// 2. Generador para Entradas (Empieza del 7 al 9)
const generarIdEntrada = () => {
  const primero = Math.floor(Math.random() * 3) + 7; // 7 a 9
  const resto = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${primero}${resto}`;
};

export const createPendingOrder = async (items, total) => {
  try {
    // El ID principal de la orden será el de la barra
    const orderId = generarIdBarra(); 
    
    // Procesamos los items para inyectarle un ID único de 6 números a cada entrada
    const itemsProcesados = items.map(item => {
      if (item.id.startsWith('ent')) {
        const asistentes = item.asistentes || ['Entrada General'];
        // Reemplazamos la lista de nombres por una lista de objetos { nombre, ticketId }
        const asistentesData = asistentes.map(nombre => ({
          nombre,
          ticketId: generarIdEntrada()
        }));
        return { ...item, asistentesData };
      }
      return item;
    });

    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    
    // Guardamos un array plano con todos los IDs de entradas para que la app del staff los encuentre rápido
    const entradasIds = itemsProcesados
      .filter(i => i.id.startsWith('ent'))
      .flatMap(i => i.asistentesData.map(a => a.ticketId));

    const newOrder = {
      items: itemsProcesados,
      total,
      status: "pendiente",
      createdAt: serverTimestamp(),
      entradasIds, // <-- Array con los códigos de 6 números de las entradas
      barraEntregada: false
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