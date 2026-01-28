import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Package,
  Settings,
  Image as ImageIcon,
  LogOut,
  Loader2,
  Shield,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useProducts, useAddProduct, useUpdateProduct, useDeleteProduct, Product } from '@/hooks/useProducts';
import { useDiscordWebhook, useUpdateDiscordWebhook } from '@/hooks/useSettings';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: webhookUrl, isLoading: webhookLoading } = useDiscordWebhook();
  
  const addProductMutation = useAddProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const updateWebhookMutation = useUpdateDiscordWebhook();

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [webhookInput, setWebhookInput] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    image_url: '',
  });

  const [editProduct, setEditProduct] = useState<Partial<Product>>({});

  useEffect(() => {
    if (webhookUrl !== undefined) {
      setWebhookInput(webhookUrl);
    }
  }, [webhookUrl]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleAddProduct = () => {
    if (!newProduct.name.trim() || newProduct.price <= 0) {
      toast.error('Preencha o nome e preço corretamente!');
      return;
    }

    addProductMutation.mutate({
      name: newProduct.name,
      description: newProduct.description || undefined,
      price: newProduct.price,
      image_url: newProduct.image_url || undefined,
    });
    
    setNewProduct({ name: '', description: '', price: 0, image_url: '' });
    setIsAddingProduct(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setEditProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
    });
  };

  const handleSaveEdit = () => {
    if (!editingProductId) return;

    if (!editProduct.name?.trim() || (editProduct.price || 0) <= 0) {
      toast.error('Preencha o nome e preço corretamente!');
      return;
    }

    updateProductMutation.mutate({
      id: editingProductId,
      name: editProduct.name,
      description: editProduct.description,
      price: editProduct.price,
      image_url: editProduct.image_url,
    });
    
    setEditingProductId(null);
    setEditProduct({});
  };

  const handleDeleteProduct = (id: string) => {
    deleteProductMutation.mutate(id);
  };

  const handleSaveWebhook = () => {
    updateWebhookMutation.mutate(webhookInput);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 md:pt-28 pb-16 px-4">
          <div className="container mx-auto max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="street-card p-8 text-center"
            >
              <Shield className="w-16 h-16 mx-auto text-destructive mb-4" />
              <h1 className="font-display text-3xl text-primary mb-4">ACESSO NEGADO</h1>
              <p className="text-muted-foreground font-body mb-6">
                Você não tem permissão de administrador para acessar esta página.
              </p>
              <div className="space-y-3">
                <button onClick={() => navigate('/')} className="btn-vagos w-full">
                  Voltar para a Loja
                </button>
                <button onClick={handleSignOut} className="btn-vagos-outline w-full flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 md:pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="vagos-title text-5xl md:text-6xl mb-4">PAINEL ADMIN</h1>
            <div className="w-24 h-1 bg-gradient-gold mx-auto rounded-full mb-4" />
            <div className="flex items-center justify-center gap-4">
              <span className="text-muted-foreground text-sm font-body">
                Logado como: {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </motion.div>

          {/* Discord Webhook Settings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="street-card p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-primary" />
              <h2 className="font-display text-2xl text-primary tracking-wider">
                CONFIGURAÇÕES
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-heading text-card-foreground mb-2">
                  Discord Webhook URL
                </label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={webhookInput}
                    onChange={(e) => setWebhookInput(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="flex-1 bg-secondary border-primary/30 focus:border-primary text-card-foreground"
                    disabled={webhookLoading}
                  />
                  <button 
                    onClick={handleSaveWebhook} 
                    className="btn-vagos px-4"
                    disabled={updateWebhookMutation.isPending}
                  >
                    {updateWebhookMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-muted-foreground text-xs mt-2 font-body">
                  As compras serão enviadas para este canal do Discord.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Products Management */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="street-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-primary" />
                <h2 className="font-display text-2xl text-primary tracking-wider">
                  PRODUTOS
                </h2>
              </div>
              <button
                onClick={() => setIsAddingProduct(!isAddingProduct)}
                className="btn-vagos-outline flex items-center gap-2 py-2 px-4 text-sm"
              >
                {isAddingProduct ? (
                  <>
                    <X className="w-4 h-4" /> Cancelar
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Adicionar
                  </>
                )}
              </button>
            </div>

            {/* Add Product Form */}
            {isAddingProduct && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-secondary/50 rounded-lg p-4 mb-6 border border-primary/20"
              >
                <h3 className="font-heading text-lg text-primary mb-4">
                  Novo Produto
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-heading text-card-foreground mb-1">
                      Nome
                    </label>
                    <Input
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      placeholder="Nome do produto"
                      className="bg-muted border-primary/30 focus:border-primary text-card-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-heading text-card-foreground mb-1">
                      Preço ($)
                    </label>
                    <Input
                      type="number"
                      value={newProduct.price || ''}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                      className="bg-muted border-primary/30 focus:border-primary text-card-foreground"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-heading text-card-foreground mb-1">
                      Descrição
                    </label>
                    <Textarea
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, description: e.target.value })
                      }
                      placeholder="Descrição do produto"
                      className="bg-muted border-primary/30 focus:border-primary text-card-foreground resize-none"
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-heading text-card-foreground mb-1">
                      URL da Imagem
                    </label>
                    <Input
                      value={newProduct.image_url}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, image_url: e.target.value })
                      }
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="bg-muted border-primary/30 focus:border-primary text-card-foreground"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddProduct}
                  disabled={addProductMutation.isPending}
                  className="btn-vagos mt-4 flex items-center gap-2"
                >
                  {addProductMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  Adicionar Produto
                </button>
              </motion.div>
            )}

            {/* Products List */}
            <div className="space-y-4">
              {productsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                </div>
              ) : !products || products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground font-body">
                    Nenhum produto cadastrado.
                  </p>
                </div>
              ) : (
                products.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    className="bg-secondary/30 rounded-lg p-4 border border-border hover:border-primary/30 transition-colors"
                  >
                    {editingProductId === product.id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-sm font-heading text-card-foreground mb-1">
                              Nome
                            </label>
                            <Input
                              value={editProduct.name || ''}
                              onChange={(e) =>
                                setEditProduct({ ...editProduct, name: e.target.value })
                              }
                              className="bg-muted border-primary/30 focus:border-primary text-card-foreground"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-heading text-card-foreground mb-1">
                              Preço ($)
                            </label>
                            <Input
                              type="number"
                              value={editProduct.price || ''}
                              onChange={(e) =>
                                setEditProduct({
                                  ...editProduct,
                                  price: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="bg-muted border-primary/30 focus:border-primary text-card-foreground"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-heading text-card-foreground mb-1">
                              Descrição
                            </label>
                            <Textarea
                              value={editProduct.description || ''}
                              onChange={(e) =>
                                setEditProduct({
                                  ...editProduct,
                                  description: e.target.value,
                                })
                              }
                              className="bg-muted border-primary/30 focus:border-primary text-card-foreground resize-none"
                              rows={2}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-heading text-card-foreground mb-1">
                              URL da Imagem
                            </label>
                            <Input
                              value={editProduct.image_url || ''}
                              onChange={(e) =>
                                setEditProduct({
                                  ...editProduct,
                                  image_url: e.target.value,
                                })
                              }
                              className="bg-muted border-primary/30 focus:border-primary text-card-foreground"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            disabled={updateProductMutation.isPending}
                            className="btn-vagos py-2 px-4 text-sm flex items-center gap-2"
                          >
                            {updateProductMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            Salvar
                          </button>
                          <button
                            onClick={() => {
                              setEditingProductId(null);
                              setEditProduct({});
                            }}
                            className="btn-vagos-outline py-2 px-4 text-sm flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-center gap-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading text-lg text-primary font-semibold truncate">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate font-body">
                            {product.description || 'Sem descrição'}
                          </p>
                          <p className="text-primary font-heading font-semibold mt-1">
                            ${product.price.toLocaleString('pt-BR')}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deleteProductMutation.isPending}
                            className="w-10 h-10 rounded-lg bg-destructive/20 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          >
                            {deleteProductMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
