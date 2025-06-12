
import React, { useState } from 'react';
import { X, Upload, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast'; // Corrected path for ShadCN UI
import { WardrobeItemCreate } from './WardrobeManager'; // Import the interface

export interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newItem: WardrobeItemCreate) => void; // Use imported interface
}

const AddItemModal = ({ isOpen, onClose, onSave }: AddItemModalProps) => {
  const [itemData, setItemData] = useState({
    name: '',
    brand: '',
    category: 'Shirts', // Default category
    size: '',
    price: '',
    material: '',
    season: 'All Seasons', // Default season
    image_url: '', // Changed from image to image_url
    tags: '',
    color: '', // Added optional field
    notes: '', // Added optional field
  });
  const { toast } = useToast(); // Standard toast, not from hooks

  const categories = ['Shirts', 'Pants', 'Dresses', 'Shoes', 'Accessories', 'Jackets', 'Sweaters', 'Other'];
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Seasons'];
  // Optional: Define some common colors or allow free text
  // const commonColors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown', 'Gray', 'Beige'];


  const handleSave = () => {
    if (!itemData.name || !itemData.brand || !itemData.category) { // Added category check
      toast({
        title: "Missing Required Fields",
        description: "Please fill in Name, Brand, and Category.",
        variant: "destructive",
      });
      return;
    }

    const newItem: WardrobeItemCreate = {
      name: itemData.name,
      brand: itemData.brand,
      category: itemData.category,
      size: itemData.size,
      price: parseFloat(itemData.price) || 0, // Ensure price is a number
      material: itemData.material,
      season: itemData.season,
      image_url: itemData.image_url || undefined, // Send undefined if empty, backend might handle default
      tags: itemData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      color: itemData.color || undefined,
      notes: itemData.notes || undefined,
    };

    onSave(newItem); // This will now call WardrobeManager's handleSaveItem

    // Reset form and close. Toast is handled by WardrobeManager after API call.
    setItemData({
      name: '',
      brand: '',
      category: 'Shirts',
      size: '',
      price: '',
      material: '',
      season: 'All Seasons',
      image_url: '',
      tags: '',
      color: '',
      notes: '',
    });
    onClose();
    // Toast is removed from here, will be shown by WardrobeManager
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

            <div>
              <label className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
                Image URL
              </label>
              <Input
                value={itemData.image_url}
                onChange={(e) => setItemData({...itemData, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg"
                className="bg-white/80 border-owis-sage/30 text-sm xs:text-base h-10 xs:h-11"
              />
            </div>
            <div>
              <label className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
                Color (optional)
              </label>
              <Input
                value={itemData.color}
                onChange={(e) => setItemData({...itemData, color: e.target.value})}
                placeholder="e.g., Blue, Multi-color"
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

          <div>
            <label className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
              Notes (optional)
            </label>
            <textarea
              value={itemData.notes}
              onChange={(e) => setItemData({...itemData, notes: e.target.value})}
              placeholder="e.g., Purchased for wedding, very comfortable"
              rows={2}
              className="w-full p-2 xs:p-3 text-sm xs:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
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
