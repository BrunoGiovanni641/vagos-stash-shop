import { useProductStore } from '@/stores/productStore';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';

const ProductGrid = () => {
  const products = useProductStore((state) => state.products);

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

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg font-body">
              Nenhum produto disponível no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
