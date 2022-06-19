import { FC } from 'react';
import NextLink from 'next/link';
import {
  Box,
  CardActionArea,
  CardMedia,
  Grid,
  Link,
  Typography,
} from '@mui/material';
import { ItemCounter } from '@components/ui';
import { Button } from '@mui/material';
import { useAppSelector } from '@store/hooks';
import { ICardProduct, IOrderItem } from '@interfaces';
import { useCart } from '@hooks';

interface Props {
  editable?: boolean;
  products?: IOrderItem[];
}

export const CartList: FC<Props> = ({ editable = false, products }) => {
  const productsInCart = useAppSelector(({ cart }) => cart.productsInCart);

  const { updateQuantity, removeProductInCart } = useCart();

  const onQuantityChange = (product: ICardProduct, newQuantity: number) => {
    updateQuantity({ ...product, quantity: newQuantity });
  };

  const productsToShow = products ? products : productsInCart;

  return (
    <>
      {productsToShow.map((product) => (
        <Grid
          container
          spacing={2}
          key={product.slug + product.size}
          sx={{ mb: 1 }}
        >
          <Grid item xs={3}>
            <NextLink href={`/product/${product.slug}`} passHref>
              <Link>
                <CardActionArea>
                  <CardMedia
                    image={`/products/${product.image}`}
                    component="img"
                    sx={{ borderRadius: '5px' }}
                  />
                </CardActionArea>
              </Link>
            </NextLink>
          </Grid>
          <Grid item xs={7}>
            <Box display="flex" flexDirection="column">
              <Typography variant="body1">{product.title}</Typography>
              <Typography variant="body1">
                Size: <strong>{product.size}</strong>
              </Typography>

              {editable ? (
                <ItemCounter
                  currentValue={product.quantity}
                  maxValue={10}
                  updateValue={(value) =>
                    onQuantityChange(product as ICardProduct, value)
                  }
                />
              ) : (
                <Typography variant="h5">
                  {product.quantity} {product.quantity > 1 ? 'items' : 'item'}
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid
            item
            xs={2}
            display="flex"
            alignItems="center"
            flexDirection="column"
          >
            <Typography variant="subtitle1">{`$${product.price}`}</Typography>

            {editable && (
              <Button
                variant="text"
                color="secondary"
                onClick={() => removeProductInCart(product as ICardProduct)}
              >
                Remove
              </Button>
            )}
          </Grid>
        </Grid>
      ))}
    </>
  );
};
