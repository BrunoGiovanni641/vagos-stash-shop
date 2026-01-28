import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product } from '@/types/product';
import { useCartStore } from '@/stores/cartStore';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} adicionado ao carrinho!`, {
      description: `Quantidade: ${quantity}`,
    });
    setQuantity(1);
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="street-card overflow-hidden group"
    >
      {/* Product Image */}
      <div className="relative h-48 bg-secondary overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <span className="text-6xl font-display text-primary/30">LV</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
      </div>

      {/* Product Info */}
      <div className="p-5">
        <h3 className="font-display text-2xl text-primary mb-2 tracking-wide">
          {product.name}
        </h3>
        <p className="text-card-foreground/70 text-sm mb-4 line-clamp-2 font-body">
          {product.description}
        </p>

        {/* Price */}
        <div className="price-tag mb-4">
          $ {product.price.toLocaleString('pt-BR')}
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-card-foreground/70 text-sm font-heading">Quantidade:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={decrementQuantity}
              className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-heading text-lg text-primary">
              {quantity}
            </span>
            <button
              onClick={incrementQuantity}
              className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="btn-vagos w-full flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          Adicionar
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
