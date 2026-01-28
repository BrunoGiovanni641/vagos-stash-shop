import { useProducts, Product } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const ProductGrid = () => {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) {
    return (
      <section id="produtos" className="py-16 px-4">
        <div className="container mx-auto flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="produtos" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center py-16">
            <p className="text-destructive text-lg font-body">
              Erro ao carregar produtos. Tente novamente mais tarde.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="produtos" className="py-16 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="vagos-title text-5xl md:text-6xl mb-4">PRODUTOS</h2>
          <div className="w-24 h-1 bg-gradient-gold mx-auto rounded-full" />
        </motion.div>

        {!products || products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg font-body">
              Nenhum produto disponível no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: Product, index: number) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
