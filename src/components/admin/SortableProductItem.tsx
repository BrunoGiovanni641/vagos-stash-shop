import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import {
  GripVertical,
  Trash2,
  Edit3,
  Save,
  X,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface SortableProductItemProps {
  product: Product;
  isEditing: boolean;
  editProduct: Partial<Product>;
  onEdit: (product: Product) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onEditChange: (updates: Partial<Product>) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

const SortableProductItem = ({
  product,
  isEditing,
  editProduct,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onEditChange,
  isUpdating,
  isDeleting,
}: SortableProductItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className="bg-secondary/30 rounded-lg p-4 border border-border hover:border-primary/30 transition-colors"
    >
      {isEditing ? (
        // Edit Mode
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-heading text-card-foreground mb-1">
                Nome
              </label>
              <Input
                value={editProduct.name || ''}
                onChange={(e) => onEditChange({ name: e.target.value })}
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
                  onEditChange({ price: parseFloat(e.target.value) || 0 })
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
                onChange={(e) => onEditChange({ description: e.target.value })}
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
                onChange={(e) => onEditChange({ image_url: e.target.value })}
                className="bg-muted border-primary/30 focus:border-primary text-card-foreground"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onSaveEdit}
              disabled={isUpdating}
              className="btn-vagos py-2 px-4 text-sm flex items-center gap-2"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Salvar
            </button>
            <button
              onClick={onCancelEdit}
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
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors cursor-grab active:cursor-grabbing touch-none"
            aria-label="Arrastar para reordenar"
          >
            <GripVertical className="w-4 h-4" />
          </button>

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
              onClick={() => onEdit(product)}
              className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              disabled={isDeleting}
              className="w-10 h-10 rounded-lg bg-destructive/20 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SortableProductItem;
