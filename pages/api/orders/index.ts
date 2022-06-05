import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { db } from '@database';
import { IOrder } from '@interfaces';
import { Order, Product } from '@models';

type Data =
  | {
      message: string;
    }
  | IOrder;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  switch (req.method) {
    case 'POST':
      return createOrder(req, res);

    default:
      return res.status(200).json({ message: 'Example' });
  }
}

const createOrder = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const { orderItems, total } = req.body as IOrder;

  //Verify if the client is logged in

  const session: any = await getSession({ req });

  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  //Array of products in cart

  const productsIds = orderItems.map((item) => item._id);

  await db.connect();

  const dbProducts = await Product.find({ _id: { $in: productsIds } });

  try {
    const subTotal = orderItems.reduce((prev, current) => {
      const currentPrice = dbProducts.find(
        (prod) => prod.id === current._id
      )?.price;

      if (!currentPrice) {
        throw new Error('Verify if the product price is correct');
      }

      return prev + current.quantity * currentPrice!;
    }, 0);

    const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE || 0);

    const backendTotal = subTotal + subTotal * taxRate;

    if (total !== backendTotal) {
      throw new Error('Total is not correct');
    }

    const userId = session.user._id;
    const newOrder = new Order({ ...req.body, isPaid: false, user: userId });

    await newOrder.save();
    await db.disconnect();
    res.status(200).json(newOrder);
  } catch (error: any) {
    await db.disconnect();
    return res.status(400).json({ message: error.message || 'Check logs' });
  }
};