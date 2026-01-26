'use client';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { hydrateCart } from './slices/cartSlice';

export default function StoreProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        const savedCart = localStorage.getItem('awuraba_cart');
        if (savedCart) {
            try {
                const items = JSON.parse(savedCart);
                store.dispatch(hydrateCart(items));
            } catch (error) {
                console.error('Failed to parse saved cart:', error);
            }
        }
    }, []);

    return <Provider store={store}>{children}</Provider>;
}
