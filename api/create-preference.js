import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { items, orderId } = req.body;

    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: items.map(item => ({
          title: item.name,
          unit_price: Number(item.price),
          quantity: Number(item.quantity),
          currency_id: 'UYU'
        })),
        // Las back_urls deben estar estrictamente aquí adentro del body
        back_urls: {
          success: 'https://variete.vercel.app/success',
          failure: 'https://variete.vercel.app/',
          pending: 'https://variete.vercel.app/'
        },
        auto_return: 'approved',
        external_reference: orderId,
      }
    });

    res.status(200).json({ init_point: result.init_point });

  } catch (error) {
    console.error('Error al crear preferencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}