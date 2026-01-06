import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types/shop';
import { products } from '@/lib/shop-data';

interface ShopState {
    products: Product[];
    filteredProducts: Product[];
    activeFilter: string; // 'All', 'New Drop', or Category Name
}

const initialState: ShopState = {
    products: products,
    filteredProducts: products,
    activeFilter: 'All',
};

const shopSlice = createSlice({
    name: 'shop',
    initialState,
    reducers: {
        setFilter: (state, action: PayloadAction<string>) => {
            const filter = action.payload;
            state.activeFilter = filter;

            if (filter === 'All') {
                state.filteredProducts = state.products;
            } else if (filter === 'New Drop') {
                state.filteredProducts = state.products.filter(p => p.isNewDrop);
            } else {
                state.filteredProducts = state.products.filter(p => p.category === filter || p.collection === filter);
            }
        },
    },
});

export const { setFilter } = shopSlice.actions;
export default shopSlice.reducer;
