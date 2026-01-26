import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import cartReducer, {
    addToCart,
    removeFromCart,
    updateQuantity,
    updateNote,
    updateCartItem,
    clearCart
} from './slices/cartSlice';
import shopReducer from './slices/shopSlice';

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
    matcher: isAnyOf(
        addToCart,
        removeFromCart,
        updateQuantity,
        updateNote,
        updateCartItem,
        clearCart
    ),
    effect: async (action, listenerApi) => {
        // Debounce: cancel any dynamic ongoing listener
        listenerApi.cancelActiveListeners();

        // Wait for 500ms
        await listenerApi.delay(500);

        const state = listenerApi.getState() as RootState;
        if (typeof window !== 'undefined') {
            localStorage.setItem('awuraba_cart', JSON.stringify(state.cart.items));
        }
    },
});

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        shop: shopReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
