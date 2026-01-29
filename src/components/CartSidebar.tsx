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
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);

  const { items, removeFromCart, updateQuantity, clearCart, getTotal, getItemCount } =
    useCartStore();

  // 🔧 CORREÇÃO: buscar webhook SEM quebrar compra anônima
  useEffect(() => {
    if (!isOpen) return;

    const fetchWebhook = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'discord_webhook_url')
        .maybeSingle();

      // 👇 SE USUÁRIO NÃO PUDER LER SETTINGS, IGNORA
      if (error) {
        console.warn('Webhook não disponível para usuário anônimo');
        setWebhookUrl(null);
        return;
      }

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

      // ✅ COMPRA ANÔNIMA FUNCIONA AQUI
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          contact_ingame: contactIngame,
          total,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: Number(item.quantity),
        price: Number(item.product.price),
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 📨 Webhook é OPCIONAL
      if (webhookUrl) {
        const orderDetails = items
          .map(
            (item) =>
              `• **${item.product.name}** x${item.quantity} - $${(
                item.product.price * item.quantity
              ).toLocaleString('pt-BR')}`
          )
          .join('\n');

        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [
              {
                title: '🛒 Nova Compra - Los Vagos',
                color: 16761600,
                fields: [
                  { name: '📦 Produtos', value: orderDetails },
                  { name: '💰 Total', value: `$${total.toLocaleString('pt-BR')}` },
                  { name: '🎮 Contato In-Game', value: contactIngame },
                ],
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        });
      }

      toast.success('Pedido enviado com sucesso!');
      clearCart();
      setContactIngame('');
      setIsOpen(false);
    } catch (error: any) {
      console.error('ERRO REAL 👉', error);
      toast.error(error?.message || 'Erro ao enviar pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemCount = getItemCount();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 btn-vagos rounded-full w-16 h-16 flex items-center justify-center"
      >
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-destructive w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
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
              className="fixed inset-0 bg-background/80 z-50"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-card z-50 flex flex-col"
            >
              {/* resto do layout permanece igual */}
              {/* botão Finalizar Compra chama handleSubmitOrder */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartSidebar;
