import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productList = await AsyncStorage.getItem(
        '@GoMarketplace:cartproducts',
      );
      productList && setProducts(JSON.parse(productList));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const { id, title, image_url, price } = product;
      const productList = [...products];
      const findProductIndex = productList.findIndex(
        item => item.id === product.id,
      );

      if (findProductIndex >= 0) {
        productList[findProductIndex].quantity += 1;
      } else {
        const newProduct = { id, title, image_url, price, quantity: 1 };
        productList.push(newProduct);
      }

      setProducts(productList);
      await AsyncStorage.setItem(
        '@GoMarketplace:cartproducts',
        JSON.stringify(productList),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productList = [...products];
      const productIndex = productList.findIndex(item => item.id === id);
      productList[productIndex].quantity += 1;
      setProducts(productList);
      await AsyncStorage.setItem(
        '@GoMarketplace:cartproducts',
        JSON.stringify(productList),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productList = [...products];
      const productIndex = productList.findIndex(item => item.id === id);
      if (productList[productIndex].quantity > 1) {
        productList[productIndex].quantity -= 1;
      } else {
        productList.splice(productIndex, 1);
      }
      setProducts(productList);
      await AsyncStorage.setItem(
        '@GoMarketplace:cartproducts',
        JSON.stringify(productList),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
