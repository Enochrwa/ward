import React, { useState } from 'react';
import { Plus, Search, Filter, Grid, List, Heart, Star, Calendar, MoreVertical, Edit, Trash2, Clock, History, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AddItemModal from './AddItemModal';
import CreateOutfitModal from './CreateOutfitModal';
import PlanWeekModal from './PlanWeekModal';
import SavedWeeklyPlans from './SavedWeeklyPlans';
import OccasionPlanner from './OccasionPlanner';
import StyleHistory from './StyleHistory';
import OutfitOrganizer from './OutfitOrganizer';

interface WardrobeItem {
  id: number;
  name: string;
  brand: string;
  category: string;
  size: string;
  price: number;
  material: string;
  season: string;
  image: string;
  tags: string[];
  favorite: boolean;
  timesWorn: number;
  dateAdded: string;
}

const mockWardrobeItems: WardrobeItem[] = [
  {
    id: 1,
    name: 'Striped Linen Shirt',
    brand: 'Zara',
    category: 'Shirts',
    size: 'M',
    price: 39.99,
    material: 'Linen',
    season: 'Summer',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3441b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNoaXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=900&q=60',
    tags: ['casual', 'summer', 'linen'],
    favorite: false,
    timesWorn: 5,
    dateAdded: '2023-01-15',
  },
  {
    id: 2,
    name: 'Slim Fit Jeans',
    brand: 'Levi\'s',
    category: 'Pants',
    size: '32',
    price: 79.50,
    material: 'Denim',
    season: 'All Seasons',
    image: 'https://images.unsplash.com/photo-1602422318539-891d3321d4f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGplYW5zfGVufDB8fDB8fHww&auto=format&fit=crop&w=900&q=60',
    tags: ['jeans', 'slim fit', 'denim'],
    favorite: true,
    timesWorn: 12,
    dateAdded: '2022-11-20',
  },
  {
    id: 3,
    name: 'Leather Ankle Boots',
    brand: 'Dr. Martens',
    category: 'Shoes',
    size: '9',
    price: 150.00,
    material: 'Leather',
    season: 'Fall',
    image: 'https://images.unsplash.com/photo-1543168286-55b371d89943?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ym9vdHN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=900&q=60',
    tags: ['boots', 'leather', 'ankle'],
    favorite: true,
    timesWorn: 8,
    dateAdded: '2023-03-01',
  },
  {
    id: 4,
    name: 'Cashmere Sweater',
    brand: 'Uniqlo',
    category: 'Sweaters',
    size: 'L',
    price: 99.90,
    material: 'Cashmere',
    season: 'Winter',
    image: 'https://images.unsplash.com/photo-1618354714047-1c9cae171326?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c3dlYXRlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=900&q=60',
    tags: ['sweater', 'cashmere', 'winter'],
    favorite: false,
    timesWorn: 3,
    dateAdded: '2023-09-10',
  },
  {
    id: 5,
    name: 'Denim Jacket',
    brand: 'Old Navy',
    category: 'Jackets',
    size: 'XL',
    price: 59.99,
    material: 'Denim',
    season: 'Spring',
    image: 'https://images.unsplash.com/photo-1587672784930-17c739f97919?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGphY2tldHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=900&q=60',
    tags: ['jacket', 'denim', 'casual'],
    favorite: false,
    timesWorn: 7,
    dateAdded: '2022-06-22',
  },
  {
    id: 6,
    name: 'Silk Scarf',
    brand: 'Gucci',
    category: 'Accessories',
    size: 'One Size',
    price: 250.00,
    material: 'Silk',
    season: 'All Seasons',
    image: 'https://images.unsplash.com/photo-1634473056854-3a6a40593306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHNjYXJmfGVufDB8fDB8fHww&auto=format&fit=crop&w=900&q=60',
    tags: ['scarf', 'silk', 'luxury'],
    favorite: true,
    timesWorn: 2,
    dateAdded: '2023-07-04',
  },
];

const WardrobeManager = () => {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>(mockWardrobeItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateOutfitOpen, setIsCreateOutfitOpen] = useState(false);
  const [isPlanWeekOpen, setIsPlanWeekOpen] = useState(false);
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  const [isOccasionPlannerOpen, setIsOccasionPlannerOpen] = useState(false);
  const [isStyleHistoryOpen, setIsStyleHistoryOpen] = useState(false);
  const [isOutfitOrganizerOpen, setIsOutfitOrganizerOpen] = useState(false);

  const filteredItems = wardrobeItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(wardrobeItems.map(item => item.category)))];

  const toggleFavorite = (id: number) => {
    setWardrobeItems(items =>
      items.map(item =>
        item.id === id ? { ...item, favorite: !item.favorite } : item
      )
    );
  };

  const handleSaveItem = (newItem: any) => {
    const item = {
      id: Date.now(),
      ...newItem,
      favorite: false,
      timesWorn: 0,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setWardrobeItems(prev => [...prev, item]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-owis-cream via-white to-owis-mint p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-owis-forest to-owis-sage bg-clip-text text-transparent">
              My Wardrobe
            </h1>
            <p className="text-owis-charcoal/70 mt-1 text-sm sm:text-base">
              Manage your fashion collection
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none bg-gradient-to-r from-owis-gold to-owis-bronze hover:from-owis-gold-dark hover:to-owis-bronze text-owis-forest"
            >
              <Plus size={16} className="mr-2" />
              <span className="hidden xs:inline">Add Item</span>
              <span className="xs:hidden">Add</span>
            </Button>
            <Button 
              onClick={() => setIsCreateOutfitOpen(true)}
              variant="outline"
              className="flex-1 sm:flex-none border-owis-forest text-owis-forest hover:bg-owis-forest hover:text-white"
            >
              <Star size={16} className="mr-2" />
              <span className="hidden xs:inline">Create Outfit</span>
              <span className="xs:hidden">Outfit</span>
            </Button>
            <Button 
              onClick={() => setIsPlanWeekOpen(true)}
              variant="outline"
              className="flex-1 sm:flex-none border-owis-sage text-owis-sage hover:bg-owis-sage hover:text-white"
            >
              <Calendar size={16} className="mr-2" />
              <span className="hidden xs:inline">Plan Week</span>
              <span className="xs:hidden">Plan</span>
            </Button>
            <Button 
              onClick={() => setShowSavedPlans(true)}
              variant="outline"
              className="flex-1 sm:flex-none border-owis-gold text-owis-gold hover:bg-owis-gold hover:text-owis-forest"
            >
              <Calendar size={16} className="mr-2" />
              <span className="hidden sm:inline">Saved Plans</span>
              <span className="sm:hidden">Plans</span>
            </Button>
          </div>
        </div>

        {/* New Occasion & Style Tools */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Button 
            onClick={() => setIsOccasionPlannerOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
          >
            <Users size={16} className="mr-2" />
            <span className="hidden sm:inline">Occasion Planner</span>
            <span className="sm:hidden">Occasions</span>
          </Button>
          <Button 
            onClick={() => setIsStyleHistoryOpen(true)}
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
          >
            <History size={16} className="mr-2" />
            <span className="hidden sm:inline">Style History</span>
            <span className="sm:hidden">History</span>
          </Button>
          <Button 
            onClick={() => setIsOutfitOrganizerOpen(true)}
            variant="outline"
            className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
          >
            <Grid size={16} className="mr-2" />
            <span className="hidden sm:inline">Outfit Organizer</span>
            <span className="sm:hidden">Organize</span>
          </Button>
        </div>

        {/* Filters - Responsive */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-owis-charcoal/40" size={20} />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 border-owis-sage/30 focus:border-owis-gold"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category 
                  ? "bg-owis-gold text-owis-forest hover:bg-owis-gold-dark" 
                  : "border-owis-sage/30 text-owis-sage hover:bg-owis-sage hover:text-white"
                }
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? "bg-owis-sage text-white" : "border-owis-sage/30 text-owis-sage"}
            >
              <Grid size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? "bg-owis-sage text-white" : "border-owis-sage/30 text-owis-sage"}
            >
              <List size={16} />
            </Button>
          </div>
        </div>

        {/* Items Grid/List - Extremely Responsive */}
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6"
            : "space-y-3 sm:space-y-4"
        }>
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className={`group hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm border-white/30 hover:border-owis-gold/50 ${
                viewMode === 'list' ? 'flex flex-row' : ''
              }`}
            >
              <div className={viewMode === 'list' ? 'w-20 sm:w-24 lg:w-32 flex-shrink-0' : 'aspect-square'}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <CardContent className={`p-3 sm:p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-owis-charcoal text-sm sm:text-base truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-owis-charcoal/60 truncate">
                      {item.brand}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(item.id)}
                    className="ml-2 flex-shrink-0 p-1 h-auto"
                  >
                    <Heart 
                      size={16} 
                      className={item.favorite ? "fill-red-500 text-red-500" : "text-owis-charcoal/40"} 
                    />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs bg-owis-sage/10 text-owis-sage border-owis-sage/20">
                      {item.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-owis-gold/30 text-owis-gold">
                      ${item.price}
                    </Badge>
                  </div>

                  {viewMode === 'grid' && (
                    <div className="text-xs text-owis-charcoal/50 space-y-1">
                      <p>Worn: {item.timesWorn} times</p>
                      <p>Size: {item.size}</p>
                    </div>
                  )}

                  {viewMode === 'list' && (
                    <div className="grid grid-cols-2 gap-2 text-xs text-owis-charcoal/60">
                      <p>Size: {item.size}</p>
                      <p>Worn: {item.timesWorn}x</p>
                      <p>Material: {item.material}</p>
                      <p>Season: {item.season}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-owis-charcoal/60 text-lg">No items found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddItemModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveItem}
      />

      <CreateOutfitModal
        isOpen={isCreateOutfitOpen}
        onClose={() => setIsCreateOutfitOpen(false)}
        wardrobeItems={wardrobeItems}
      />

      <PlanWeekModal
        isOpen={isPlanWeekOpen}
        onClose={() => setIsPlanWeekOpen(false)}
      />

      <SavedWeeklyPlans
        isOpen={showSavedPlans}
        onClose={() => setShowSavedPlans(false)}
      />

      <OccasionPlanner
        isOpen={isOccasionPlannerOpen}
        onClose={() => setIsOccasionPlannerOpen(false)}
      />

      <StyleHistory
        isOpen={isStyleHistoryOpen}
        onClose={() => setIsStyleHistoryOpen(false)}
      />

      <OutfitOrganizer
        isOpen={isOutfitOrganizerOpen}
        onClose={() => setIsOutfitOrganizerOpen(false)}
      />
    </div>
  );
};

export default WardrobeManager;
