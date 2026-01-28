import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const [quantity, setQuantity] = useState('1');
  const addToCart = useCartStore((state) => state.addToCart);

  const handleQuantityChange = (value: string) => {
    // Allow only numbers
    const numericValue = value.replace(/\D/g, '');
    setQuantity(numericValue);
  };

  const getValidQuantity = () => {
    const num = parseInt(quantity, 10);
    return isNaN(num) || num < 1 ? 1 : num;
  };

  const handleAddToCart = () => {
    const qty = getValidQuantity();
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      imageUrl: product.image_url || '',
      createdAt: new Date(product.created_at),
    }, qty);
    toast.success(`${product.name} adicionado ao carrinho!`, {
      description: `Quantidade: ${qty}`,
    });
    setQuantity('1');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="street-card overflow-hidden group"
    >
      {/* Product Image - Fixed 256x256 */}
      <div className="relative flex items-center justify-center bg-secondary overflow-hidden p-4">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-64 h-64 object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center bg-gradient-to-br from-secondary to-muted rounded-lg">
            <span className="text-6xl font-display text-primary/30">LV</span>
          </div>
        )}
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

        {/* Quantity Input */}
        <div className="flex items-center gap-3 mb-4">
          <label className="text-card-foreground/70 text-sm font-heading">Quantidade:</label>
          <Input
            type="text"
            inputMode="numeric"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            onBlur={() => {
              if (!quantity || parseInt(quantity) < 1) {
                setQuantity('1');
              }
            }}
            className="w-20 text-center bg-secondary border-primary/30 focus:border-primary text-card-foreground font-heading text-lg"
          />
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
