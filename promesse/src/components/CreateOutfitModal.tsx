
import React, { useState } from 'react';
import { X, Plus, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface WardrobeItem {
  id: number;
  name: string;
  brand: string;
  category: string;
  image: string;
  tags?: string[];
}

export interface CreateOutfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  wardrobeItems: WardrobeItem[];
}

const CreateOutfitModal = ({ isOpen, onClose, wardrobeItems }: CreateOutfitModalProps) => {
  const [outfitName, setOutfitName] = useState('');
  const [selectedItems, setSelectedItems] = useState<WardrobeItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  const categories = ['all', ...Array.from(new Set(wardrobeItems.map(item => item.category)))];

  const filteredItems = wardrobeItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesCategory;
  });

  const toggleItemSelection = (item: WardrobeItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.id === item.id);
      if (isSelected) {
        return prev.filter(selected => selected.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const saveOutfit = () => {
    if (!outfitName || selectedItems.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide an outfit name and select at least one item.",
        variant: "destructive"
      });
      return;
    }

    const savedOutfits = JSON.parse(localStorage.getItem('savedOutfits') || '[]');
    const newOutfit = {
      id: Date.now(),
      name: outfitName,
      items: selectedItems,
      createdAt: new Date().toISOString()
    };
    
    savedOutfits.push(newOutfit);
    localStorage.setItem('savedOutfits', JSON.stringify(savedOutfits));
    
    toast({
      title: "Outfit Saved!",
      description: `"${outfitName}" has been saved to your collection.`,
    });

    setOutfitName('');
    setSelectedItems([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 xs:p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl xs:rounded-3xl w-full max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl max-h-[95vh] xs:max-h-[90vh] overflow-y-auto">
        <div className="p-3 xs:p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Create Outfit</h2>
            <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400">Select items to create a perfect outfit</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 xs:p-2">
            <X size={16} className="xs:w-5 xs:h-5" />
          </Button>
        </div>

        <div className="p-3 xs:p-4 sm:p-6 space-y-4 xs:space-y-6">
          <div>
            <label className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
              Outfit Name
            </label>
            <input
              type="text"
              value={outfitName}
              onChange={(e) => setOutfitName(e.target.value)}
              placeholder="e.g., Summer Date Night, Business Meeting"
              className="w-full p-2 xs:p-3 text-sm xs:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-10 xs:h-11"
            />
          </div>

          <div className="flex flex-wrap gap-1 xs:gap-2 mb-3 xs:mb-4">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`text-xs xs:text-sm h-8 xs:h-9 px-2 xs:px-3 ${selectedCategory === category 
                  ? "bg-owis-gold text-owis-forest" 
                  : "border-owis-sage/30 text-owis-sage hover:bg-owis-sage hover:text-white"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          {selectedItems.length > 0 && (
            <div className="bg-owis-mint/20 rounded-lg p-3 xs:p-4">
              <h3 className="font-semibold text-owis-forest mb-2 xs:mb-3 text-sm xs:text-base">Selected Items ({selectedItems.length})</h3>
              <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 xs:gap-3">
                {selectedItems.map(item => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-16 xs:h-20 object-cover rounded-lg border-2 border-owis-gold"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => toggleItemSelection(item)}
                      className="absolute -top-1 -right-1 w-5 h-5 xs:w-6 xs:h-6 rounded-full p-0 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </Button>
                    <p className="text-xs text-center mt-1 text-owis-charcoal truncate">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 xs:mb-3 text-sm xs:text-base">Available Items</h3>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 xs:gap-3 max-h-64 xs:max-h-80 sm:max-h-96 overflow-y-auto">
              {filteredItems.map(item => {
                const isSelected = selectedItems.some(selected => selected.id === item.id);
                return (
                  <div 
                    key={item.id} 
                    className={`cursor-pointer rounded-lg border-2 p-1 xs:p-2 transition-all hover:shadow-lg ${
                      isSelected 
                        ? 'border-owis-gold bg-owis-gold/10' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-owis-sage'
                    }`}
                    onClick={() => toggleItemSelection(item)}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-16 xs:h-20 object-cover rounded-lg mb-1 xs:mb-2"
                    />
                    <h4 className="font-medium text-xs text-gray-900 dark:text-white truncate">{item.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{item.brand}</p>
                    <p className="text-xs text-owis-sage">{item.category}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 pt-3 xs:pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose} className="flex-1 h-10 xs:h-11 text-sm xs:text-base">
              Cancel
            </Button>
            <Button onClick={saveOutfit} className="flex-1 h-10 xs:h-11 text-sm xs:text-base bg-owis-gold hover:bg-owis-gold-dark text-owis-forest">
              <Save size={14} className="xs:w-4 xs:h-4 mr-1 xs:mr-2" />
              Save Outfit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOutfitModal;
