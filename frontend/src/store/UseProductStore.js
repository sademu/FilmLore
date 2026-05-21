import { create } from "zustand";
import axios from "axios";

const BASE_URL="http://localhost:5005";

export const useProductStore = create((set,get) => ({
  products: [],
  loading: false,
  error: null,
    fetchProducts: async () => {   
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`${BASE_URL}/api/products`);
            set({ products: response.data.data, error:null,loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
        finally {
            set({ loading: false });
        }
    }

}));