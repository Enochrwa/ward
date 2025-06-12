import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { WardrobeItem, WardrobeItemCreate } from './WardrobeManager'; // Import interfaces

export interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (itemId: string, updatedData: Partial<WardrobeItemCreate>) => void;
  item: WardrobeItem | null;
}

const EditItemModal = ({ isOpen, onClose, onUpdate, item }: EditItemModalProps) => {
  const [formData, setFormData] = useState<Partial<WardrobeItemCreate>>({});
  const { toast } = useToast();

  const categories = ['Shirts', 'Pants', 'Dresses', 'Shoes', 'Accessories', 'Jackets', 'Sweaters', 'Other'];
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Seasons'];

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        brand: item.brand,
        category: item.category,
        size: item.size,
        price: item.price,
        material: item.material,
        season: item.season,
        image_url: item.image_url || '',
        tags: item.tags || [], // Ensure tags is an array
        color: item.color || '',
        notes: item.notes || '',
      });
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid number input
    if (value === '' || !isNaN(parseFloat(value))) {
      setFormData(prev => ({ ...prev, price: value === '' ? undefined : parseFloat(value) }));
    } else if (value === '-') { // Allow negative sign for typing negative numbers, though price shouldn't be negative
         setFormData(prev => ({ ...prev, price: 0 })); // Or handle as needed
    }
  };


  const handleSave = () => {
    if (!item || !formData.name || !formData.brand || !formData.category) {
      toast({
        title: "Missing Required Fields",
        description: "Name, Brand, and Category are required.",
        variant: "destructive",
      });
      return;
    }

    // Ensure tags are correctly formatted as an array of strings
    const finalData: Partial<WardrobeItemCreate> = {
        ...formData,
        price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price,
        tags: Array.isArray(formData.tags) ? formData.tags.filter(Boolean) : (typeof formData.tags === 'string' ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []),
    };

    onUpdate(item.id, finalData);
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-2 xs:p-3 sm:p-4"> {/* Increased z-index */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl xs:rounded-3xl w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[95vh] xs:max-h-[90vh] overflow-y-auto">
        <div className="p-3 xs:p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Edit Item</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 xs:p-2">
            <X size={16} className="xs:w-5 xs:h-5" />
          </Button>
        </div>

        <div className="p-3 xs:p-4 sm:p-6 space-y-3 xs:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
            <div>
              <label htmlFor="name" className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">Item Name *</label>
              <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} placeholder="e.g., Blue Cotton Shirt" className="bg-white/80 border-owis-sage/30 text-sm xs:text-base h-10 xs:h-11" />
            </div>
            <div>
              <label htmlFor="brand" className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">Brand *</label>
              <Input id="brand" name="brand" value={formData.brand || ''} onChange={handleChange} placeholder="e.g., Zara, H&M, Nike" className="bg-white/80 border-owis-sage/30 text-sm xs:text-base h-10 xs:h-11" />
            </div>
            <div>
              <label htmlFor="category" className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">Category *</label>
              <select id="category" name="category" value={formData.category || ''} onChange={handleChange} className="w-full p-2 xs:p-3 text-sm xs:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 h-10 xs:h-11">
                {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="size" className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">Size</label>
              <Input id="size" name="size" value={formData.size || ''} onChange={handleChange} placeholder="e.g., M, 32, 9" className="bg-white/80 border-owis-sage/30 text-sm xs:text-base h-10 xs:h-11" />
            </div>
            <div>
              <label htmlFor="price" className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">Price</label>
              <Input id="price" name="price" type="number" value={formData.price === undefined ? '' : formData.price} onChange={handlePriceChange} placeholder="0.00" className="bg-white/80 border-owis-sage/30 text-sm xs:text-base h-10 xs:h-11" />
            </div>
            <div>
              <label htmlFor="material" className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">Material</label>
              <Input id="material" name="material" value={formData.material || ''} onChange={handleChange} placeholder="e.g., Cotton, Denim, Silk" className="bg-white/80 border-owis-sage/30 text-sm xs:text-base h-10 xs:h-11" />
            </div>
            <div>
              <label htmlFor="season" className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">Season</label>
              <select id="season" name="season" value={formData.season || ''} onChange={handleChange} className="w-full p-2 xs:p-3 text-sm xs:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 h-10 xs:h-11">
                {seasons.map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="image_url" className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">Image URL</label>
              <Input id="image_url" name="image_url" value={formData.image_url || ''} onChange={handleChange} placeholder="https://example.com/image.jpg" className="bg-white/80 border-owis-sage/30 text-sm xs:text-base h-10 xs:h-11" />
            </div>
            <div>
              <label htmlFor="color" className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">Color</label>
              <Input id="color" name="color" value={formData.color || ''} onChange={handleChange} placeholder="e.g., Blue, Multi-color" className="bg-white/80 border-owis-sage/30 text-sm xs:text-base h-10 xs:h-11" />
            </div>
          </div>
          <div>
            <label htmlFor="tags" className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">Tags (comma separated)</label>
            <Input id="tags" name="tags" value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''} onChange={handleTagsChange} placeholder="casual, summer, cotton" className="bg-white/80 border-owis-sage/30 text-sm xs:text-base h-10 xs:h-11" />
          </div>
          <div>
            <label htmlFor="notes" className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">Notes</label>
            <textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="e.g., Purchased for wedding, very comfortable" rows={2} className="w-full p-2 xs:p-3 text-sm xs:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" />
          </div>
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 pt-3 xs:pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 h-10 xs:h-11 text-sm xs:text-base">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 h-10 xs:h-11 text-sm xs:text-base bg-owis-gold hover:bg-owis-gold-dark text-owis-forest">
              <Save size={14} className="xs:w-4 xs:h-4 mr-1 xs:mr-2" />Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditItemModal;
