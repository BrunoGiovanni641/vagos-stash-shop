-- Add sort_order column to products table
ALTER TABLE public.products 
ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

-- Update existing products with sequential order based on created_at
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM public.products
)
UPDATE public.products p
SET sort_order = n.rn
FROM numbered n
WHERE p.id = n.id;