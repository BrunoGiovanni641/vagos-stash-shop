import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ProductGrid from '@/components/ProductGrid';
import CartSidebar from '@/components/CartSidebar';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 md:pt-20">
        <HeroSection />
        <ProductGrid />
      </main>
      <Footer />
      <CartSidebar />
    </div>
  );
};

export default Index;
