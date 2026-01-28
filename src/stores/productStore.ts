import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product';

interface ProductStore {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Carro Tunado',
    description: 'Veículo importado com motor V8 preparado para as ruas de Los Santos.',
    price: 15000,
    imageUrl: '',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Corrente de Ouro',
    description: 'Corrente banhada a ouro 18k, símbolo de respeito nas ruas.',
    price: 2500,
    imageUrl: '',
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Pack VIP',
    description: 'Benefícios exclusivos para membros da família Los Vagos.',
    price: 5000,
    imageUrl: '',
    createdAt: new Date(),
  },
];

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: defaultProducts,
      addProduct: (productData) =>
        set((state) => ({
          products: [
            ...state.products,
            {
              ...productData,
              id: crypto.randomUUID(),
              createdAt: new Date(),
            },
          ],
        })),
      updateProduct: (id, productData) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...productData } : p
          ),
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'los-vagos-products',
    }
  )
);
