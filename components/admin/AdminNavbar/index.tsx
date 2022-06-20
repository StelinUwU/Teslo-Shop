import NextLink from 'next/link';
import { toggleSideMenu } from '@store/ui';
import { AppBar, Box, Button, Link, Toolbar, Typography } from '@mui/material';
import { useAppDispatch } from '@store/hooks';

export const AdminNavbar = () => {
  const dispatch = useAppDispatch();

  return (
    <AppBar>
      <Toolbar>
        <NextLink href="/" passHref>
          <Link display="flex" alignItems="center">
            <Typography variant="h6">Teslo |</Typography>
            <Typography sx={{ ml: 0.5 }}>Shop</Typography>
          </Link>
        </NextLink>
        <Box flex={1} />

        <Button onClick={() => dispatch(toggleSideMenu())}>Menu</Button>
      </Toolbar>
    </AppBar>
  );
};