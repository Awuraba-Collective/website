import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '@/types/shop';

interface CartState {
    items: CartItem[];
    isOpen: boolean;
}

const initialState: CartState = {
    items: [],
    isOpen: false,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            // Check if item with same ID (which includes options) already exists
            const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);

            if (existingItemIndex > -1) {
                state.items[existingItemIndex].quantity += action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }
            // Auto open cart on add
            state.isOpen = true;
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.id !== action.payload);
        },
        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const item = state.items.find(item => item.id === action.payload.id);
            if (item) {
                item.quantity = Math.max(1, action.payload.quantity);
            }
        },
        updateNote: (state, action: PayloadAction<{ id: string; note: string }>) => {
            const item = state.items.find(item => item.id === action.payload.id);
            if (item) {
                item.note = action.payload.note;
            }
        },
        updateCartItem: (state, action: PayloadAction<{ id: string; newItem: CartItem }>) => {
            const index = state.items.findIndex(item => item.id === action.payload.id);
            if (index > -1) {
                state.items[index] = action.payload.newItem;
            }
        },
        toggleCart: (state) => {
            state.isOpen = !state.isOpen;
        },
        setCartOpen: (state, action: PayloadAction<boolean>) => {
            state.isOpen = action.payload;
        },
        clearCart: (state) => {
            state.items = [];
        },
        hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload;
        }
    },
});

export const {
    addToCart,
    removeFromCart,
    updateQuantity,
    updateNote,
    updateCartItem,
    toggleCart,
    setCartOpen,
    clearCart,
    hydrateCart
} = cartSlice.actions;
export default cartSlice.reducer;
