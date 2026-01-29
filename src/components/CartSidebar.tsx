import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Trash2, Plus, Minus, Send, Loader2 } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const CartSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [contactIngame, setContactIngame] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  const { items, removeFromCart, updateQuantity, clearCart, getTotal, getItemCount } =
    useCartStore();

  // Fetch webhook URL on mount
  useEffect(() => {
    const fetchWebhook = async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'discord_webhook_url')
        .maybeSingle();
      
      if (data?.value) {
        setWebhookUrl(data.value);
      }
    };
    fetchWebhook();
  }, [isOpen]);

  const handleSubmitOrder = async () => {
    if (!contactIngame.trim()) {
      toast.error('Por favor, insira seu contato in-game!');
      return;
    }

    if (items.length === 0) {
      toast.error('Seu carrinho está vazio!');
      return;
    }

    setIsSubmitting(true);

    try {
      const total = getTotal();

      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          contact_ingame: contactIngame,
          total: total,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Send to Discord webhook if configured
      if (webhookUrl) {
        const orderDetails = items
          .map(
            (item) =>
              `• **${item.product.name}** x${item.quantity} - $${(
                item.product.price * item.quantity
              ).toLocaleString('pt-BR')}`
          )
          .join('\n');

        const embed = {
          embeds: [
            {
              title: '🛒 Nova Compra - Los Vagos',
              color: 16761600,
              fields: [
                { name: '📦 Produtos', value: orderDetails },
                { name: '💰 Total', value: `$${total.toLocaleString('pt-BR')}` },
                { name: '🎮 Contato In-Game', value: contactIngame },
              ],
              footer: { text: 'Los Vagos - Loja Oficial' },
              timestamp: new Date().toISOString(),
            },
          ],
        };

        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(embed),
        });
      }

      toast.success('Pedido enviado com sucesso!', {
        description: 'Entraremos em contato em breve.',
      });

      clearCart();
      setContactIngame('');
      setIsOpen(false);
    } catch (error: any) {
      // 🔴 DEBUG: MOSTRA O ERRO REAL (não quebra webhook)
      console.error('ERRO REAL 👉', error);
      toast.error(
        error?.message ||
        error?.error_description ||
        JSON.stringify(error)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemCount = getItemCount();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 btn-vagos rounded-full w-16 h-16 flex items-center justify-center animate-pulse-gold"
      >
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
            {itemCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l-2 border-primary/30 z-50 flex flex-col"
            >
              {/* TODO o layout permanece igual */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartSidebar;
