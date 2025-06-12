
import React, { useState } from 'react';
import { X, Upload, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newItem: any) => void;
}

const AddItemModal = ({ isOpen, onClose, onSave }: AddItemModalProps) => {
  const [itemData, setItemData] = useState({
    name: '',
    brand: '',
    category: 'Shirts',
    size: '',
    price: '',
    material: '',
    season: 'All Seasons',
    image: '',
    tags: ''
  });
  const { toast } = useToast();

  const categories = ['Shirts', 'Pants', 'Dresses', 'Shoes', 'Accessories', 'Jackets', 'Sweaters'];
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Seasons'];

  const handleSave = () => {
    if (!itemData.name || !itemData.brand) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the name and brand.",
        variant: "destructive"
      });
      return;
    }

    const newItem = {
      ...itemData,
      price: parseFloat(itemData.price) || 0,
      tags: itemData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      image: itemData.image || 'https://images.unsplash.com/photo-1618354691373-d851c5c3441b?w=300'
    };

    onSave(newItem);
    setItemData({
      name: '',
      brand: '',
      category: 'Shirts',
      size: '',
      price: '',
      material: '',
      season: 'All Seasons',
      image: '',
      tags: ''
    });
    onClose();
    
    toast({
      title: "Item Added!",
      description: "Your new wardrobe item has been added successfully.",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 xs:p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl xs:rounded-3xl w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[95vh] xs:max-h-[90vh] overflow-y-auto">
        <div className="p-3 xs:p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Add New Item</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 xs:p-2">
            <X size={16} className="xs:w-5 xs:h-5" />
          </Button>
        </div>

        <div className="p-3 xs:p-4 sm:p-6 space-y-3 xs:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
            <div>
              <label className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
                Item Name *
              </label>
              <Input
                value={itemData.name}
                onChange={(e) => setItemData({...itemData, name: e.target.value})}
                placeholder="e.g., Blue Cotton Shirt"
                className="bg-white/80 border-owis-sage/30 text-sm xs:text-base h-10 xs:h-11"
              />
            </div>

            <div>
              <label className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
                Brand *
              </label>
              <Input
                value={itemData.brand}
                onChange={(e) => setItemData({...itemData, brand: e.target.value})}
                placeholder="e.g., Zara, H&M, Nike"
                className="bg-white/80 border-owis-sage/30 text-sm xs:text-base h-10 xs:h-11"
              />
            </div>

            <div>
              <label className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
                Category
              </label>
              <select
                value={itemData.category}
                onChange={(e) => setItemData({...itemData, category: e.target.value})}
                className="w-full p-2 xs:p-3 text-sm xs:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 h-10 xs:h-11"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
                Size
              </label>
              <Input
                value={itemData.size}
                onChange={(e) => setItemData({...itemData, size: e.target.value})}
                placeholder="e.g., M, 32, 9"
                className="bg-white/80 border-owis-sage/30 text-sm xs:text-base h-10 xs:h-11"
              />
            </div>

            <div>
              <label className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
                Price
              </label>
              <Input
                type="number"
                value={itemData.price}
                onChange={(e) => setItemData({...itemData, price: e.target.value})}
                placeholder="0.00"
                className="bg-white/80 border-owis-sage/30 text-sm xs:text-base h-10 xs:h-11"
              />
            </div>

            <div>
              <label className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
                Material
              </label>
              <Input
                value={itemData.material}
                onChange={(e) => setItemData({...itemData, material: e.target.value})}
                placeholder="e.g., Cotton, Denim, Silk"
                className="bg-white/80 border-owis-sage/30 text-sm xs:text-base h-10 xs:h-11"
              />
            </div>

            <div>
              <label className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
                Season
              </label>
              <select
                value={itemData.season}
                onChange={(e) => setItemData({...itemData, season: e.target.value})}
                className="w-full p-2 xs:p-3 text-sm xs:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 h-10 xs:h-11"
              >
                {seasons.map(season => (
                  <option key={season} value={season}>{season}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
                Image URL
              </label>
              <Input
                value={itemData.image}
                onChange={(e) => setItemData({...itemData, image: e.target.value})}
                placeholder="https://example.com/image.jpg"
                className="bg-white/80 border-owis-sage/30 text-sm xs:text-base h-10 xs:h-11"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
              Tags (comma separated)
            </label>
            <Input
              value={itemData.tags}
              onChange={(e) => setItemData({...itemData, tags: e.target.value})}
              placeholder="casual, summer, cotton"
              className="bg-white/80 border-owis-sage/30 text-sm xs:text-base h-10 xs:h-11"
            />
          </div>

          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 pt-3 xs:pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 h-10 xs:h-11 text-sm xs:text-base">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 h-10 xs:h-11 text-sm xs:text-base bg-owis-gold hover:bg-owis-gold-dark text-owis-forest">
              <Save size={14} className="xs:w-4 xs:h-4 mr-1 xs:mr-2" />
              Add Item
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
