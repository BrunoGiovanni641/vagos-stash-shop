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

  // Buscar webhook (se falhar, a compra é bloqueada)
  useEffect(() => {
    const fetchWebhook = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'discord_webhook_url')
        .maybeSingle();

      if (error || !data?.value) {
        console.warn('Webhook não configurado');
        setWebhookUrl('');
        return;
      }

      setWebhookUrl(data.value);
    };

    fetchWebhook();
  }, [isOpen]);

  const handleSubmitOrder = async () => {
    if (!webhookUrl) {
      toast.error('Sistema indisponível. Tente novamente mais tarde.');
      return;
    }

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
              {
                name: '📦 Produtos',
                value: orderDetails,
                inline: false,
              },
              {
                name: '💰 Total',
                value: `$${total.toLocaleString('pt-BR')}`,
                inline: true,
              },
              {
                name: '🎮 Contato In-Game',
                value: contactIngame,
                inline: true,
              },
            ],
            footer: {
              text: 'Los Vagos - Loja Oficial',
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(embed),
      });

      toast.success('Pedido enviado com sucesso!', {
        description: 'Entraremos em contato em breve.',
      });

      clearCart();
      setContactIngame('');
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao enviar webhook:', error);
      toast.error('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemCount = getItemCount();

  return (
    <>
      {/* Cart Button */}
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
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="font-display text-2xl text-primary tracking-wider">
                  CARRINHO
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground font-body">
                      Seu carrinho está vazio
                    </p>
                  </div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="bg-secondary/50 rounded-lg p-4 border border-border"
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-2xl font-display text-primary/30">
                                LV
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-heading text-primary font-semibold">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            ${item.product.price.toLocaleString('pt-BR')} cada
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              className="w-7 h-7 rounded bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-heading text-primary">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                              className="w-7 h-7 rounded bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="w-8 h-8 rounded-lg bg-destructive/20 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                        <span className="text-sm text-muted-foreground font-body">
                          Subtotal:
                        </span>
                        <span className="font-heading text-primary font-semibold">
                          ${(item.product.price * item.quantity).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-border p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-heading text-primary mb-2">
                      Contato In-Game (ID ou Nome)
                    </label>
                    <Input
                      type="text"
                      value={contactIngame}
                      onChange={(e) => setContactIngame(e.target.value)}
                      placeholder="Ex: ID 123 ou João_Silva"
                      className="bg-secondary border-primary/30 focus:border-primary text-card-foreground"
                    />
                  </div>

                  <div className="flex justify-between items-center py-3 border-y border-border">
                    <span className="font-heading text-lg text-card-foreground">
                      TOTAL:
                    </span>
                    <span className="price-tag text-3xl">
                      ${getTotal().toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <button
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                    className="btn-vagos w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Finalizar Compra
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartSidebar;
