import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDiscordWebhook = () => {
  return useQuery({
    queryKey: ['settings', 'discord_webhook_url'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'discord_webhook_url')
        .maybeSingle();

      if (error) throw error;
      return data?.value || '';
    },
  });
};

export const useUpdateDiscordWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (webhookUrl: string) => {
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .eq('key', 'discord_webhook_url')
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('settings')
          .update({ value: webhookUrl })
          .eq('key', 'discord_webhook_url');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('settings')
          .insert([{ key: 'discord_webhook_url', value: webhookUrl }]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'discord_webhook_url'] });
      toast.success('Webhook do Discord salvo!');
    },
    onError: (error: Error) => {
      console.error('Error saving webhook:', error);
      toast.error('Erro ao salvar webhook. Verifique se você é admin.');
    },
  });
};

// Function to send order to Discord (can be called from client)
export const sendOrderToDiscord = async (
  webhookUrl: string,
  order: {
    contactIngame: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
  }
) => {
  if (!webhookUrl) {
    console.warn('Discord webhook URL not configured');
    return;
  }

  const itemsList = order.items
    .map((item) => `• **${item.name}** x${item.quantity} - $${(item.price * item.quantity).toLocaleString('pt-BR')}`)
    .join('\n');

  const embed = {
    title: '🛒 Nova Compra - Los Vagos Shop',
    color: 0xffd700,
    fields: [
      {
        name: '📞 Contato In-Game',
        value: order.contactIngame,
        inline: false,
      },
      {
        name: '📦 Produtos',
        value: itemsList,
        inline: false,
      },
      {
        name: '💰 Total',
        value: `**$${order.total.toLocaleString('pt-BR')}**`,
        inline: false,
      },
    ],
    footer: {
      text: 'Los Vagos - Familia é tudo',
    },
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (error) {
    console.error('Error sending to Discord:', error);
  }
};
