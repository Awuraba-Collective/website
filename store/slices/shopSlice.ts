import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SerializableProduct } from '@/types';
import { shopService } from '@/services/shopService';

interface ShopState {
    products: SerializableProduct[];
    filteredProducts: SerializableProduct[];
    activeFilter: string;
    currency: string;
    currencyRate: number;
    loading: boolean;
    error: string | null;
}

const initialState: ShopState = {
    products: [],
    filteredProducts: [],
    activeFilter: 'All',
    currency: 'GHS',
    currencyRate: 1,
    loading: false,
    error: null,
};

export const fetchProducts = createAsyncThunk(
    'shop/fetchProducts',
    async () => {
        return await shopService.getProducts();
    }
);

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
                state.filteredProducts = state.products.filter(p =>
                    (p.category as any)?.name === filter ||
                    (p.collection as any)?.name === filter
                );
            }
        },
        setCurrency: (state, action: PayloadAction<{ code: string; rate: number }>) => {
            state.currency = action.payload.code;
            state.currencyRate = action.payload.rate;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<SerializableProduct[]>) => {
                state.loading = false;
                state.products = action.payload;
                // Re-apply filter on new data
                const filter = state.activeFilter;
                if (filter === 'All') {
                    state.filteredProducts = action.payload;
                } else if (filter === 'New Drop') {
                    state.filteredProducts = action.payload.filter(p => p.isNewDrop);
                } else {
                    state.filteredProducts = action.payload.filter(p =>
                        (p.category as any)?.name === filter ||
                        (p.collection as any)?.name === filter
                    );
                }
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch products';
            });
    }
});

export const { setFilter, setCurrency } = shopSlice.actions;
export default shopSlice.reducer;
