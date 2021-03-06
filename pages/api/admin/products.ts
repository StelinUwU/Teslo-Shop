import type { NextApiRequest, NextApiResponse } from 'next';
import { isValidObjectId } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { IProduct } from '@interfaces';
import { db } from '@database';
import { Product } from '@models';

cloudinary.config(process.env.CLOUDINARY_URL || '');

type Data =
  | {
      message: string;
    }
  | IProduct
  | IProduct[];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  switch (req.method) {
    case 'GET':
      return getProducts(req, res);

    case 'POST':
      return createProduct(req, res);

    case 'PUT':
      return updateProduct(req, res);
    default:
      return res.status(405).json({ message: 'Bad Request' });
  }
}

const getProducts = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  try {
    await db.connect();

    const products = await Product.find().sort({ title: 'asc' }).lean();

    await db.disconnect();
    const updatedProducts = products.map((product) => {
      product.images = product.images.map((image) => {
        return image.includes('http')
          ? image
          : `${
              process.env.HOST_NAME || process.env.VERCEL_URL
            }/products/${image}`;
      });
      return product;
    });

    res.status(200).json(updatedProducts);
  } catch (error) {
    res.status(500).json({ message: 'Oops! Something went wrong' });
  }
};

const createProduct = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  const { images = [], ...product } = req.body as IProduct;

  if (images.length < 2) {
    return res.status(400).json({ message: 'At least 2 images are required' });
  }

  try {
    await db.connect();

    const productInDB = await Product.findOne({ slug: req.body.slug });

    if (productInDB) {
      return res.status(400).json({ message: 'Product slug already exists' });
    }
    const product = new Product(req.body);
    await product.save();
    await db.disconnect();
    res.status(201).json(product);
  } catch (error) {
    await db.disconnect();
    console.log('[createProduct]', error);
    res.status(500).json({ message: 'Oops! Something went wrong' });
  }
};

const updateProduct = async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  const { _id = '', images = [] } = req.body as IProduct;

  if (!isValidObjectId(_id)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }
  if (images.length < 2) {
    return res.status(400).json({ message: 'At least 2 images are required' });
  }

  try {
    await db.connect();

    const product = await Product.findById(_id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.images.forEach(async (image) => {
      if (!images.includes(image)) {
        const [fileId, extension] = image
          .substring(image.lastIndexOf('/') + 1)
          .split('.');

        await cloudinary.uploader.destroy(
          `${process.env.CLOUDINARY_FOLDER}/${fileId}`
        );
      }
    });

    await product.update(req.body);

    await db.disconnect();

    res.status(200).json(product);
  } catch (error) {
    console.log('[updateProduct]', error);
    await db.disconnect();
    res.status(500).json({ message: 'Oops! Something went wrong' });
  }
};
