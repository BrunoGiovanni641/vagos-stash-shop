import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Settings } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isAdmin = location.pathname === '/admin';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-display text-2xl md:text-3xl text-primary gold-glow-text"
            >
              LOS VAGOS
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`font-heading text-sm tracking-wider transition-colors underline-vagos ${
                location.pathname === '/'
                  ? 'text-primary'
                  : 'text-card-foreground/70 hover:text-primary'
              }`}
            >
              LOJA
            </Link>
            <a
              href="#produtos"
              className="font-heading text-sm tracking-wider text-card-foreground/70 hover:text-primary transition-colors underline-vagos"
            >
              PRODUTOS
            </a>
            <Link
              to="/admin"
              className={`font-heading text-sm tracking-wider transition-colors flex items-center gap-1 underline-vagos ${
                isAdmin
                  ? 'text-primary'
                  : 'text-card-foreground/70 hover:text-primary'
              }`}
            >
              <Settings className="w-4 h-4" />
              ADMIN
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-primary"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{ height: isMenuOpen ? 'auto' : 0 }}
          className="md:hidden overflow-hidden"
        >
          <nav className="flex flex-col gap-4 py-4 border-t border-border">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="font-heading text-lg tracking-wider text-primary"
            >
              LOJA
            </Link>
            <a
              href="#produtos"
              onClick={() => setIsMenuOpen(false)}
              className="font-heading text-lg tracking-wider text-card-foreground/70 hover:text-primary transition-colors"
            >
              PRODUTOS
            </a>
            <Link
              to="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="font-heading text-lg tracking-wider text-card-foreground/70 hover:text-primary transition-colors flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              ADMIN
            </Link>
          </nav>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
