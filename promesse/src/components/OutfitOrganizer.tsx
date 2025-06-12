
import React, { useState } from 'react';
import { Grid, List, Filter, Star, Calendar, Tag, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface OutfitOrganizerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrganizedOutfit {
  id: number;
  name: string;
  category: string;
  season: string;
  occasion: string;
  image: string;
  items: string[];
  tags: string[];
  rating: number;
  lastWorn: string;
  timesWorn: number;
  favorite: boolean;
  notes: string;
}

const mockOrganizedOutfits: OrganizedOutfit[] = [
  {
    id: 1,
    name: 'Wedding Guest Elegant',
    category: 'Formal',
    season: 'Spring',
    occasion: 'Wedding',
    image: 'https://images.unsplash.com/photo-1566479179817-a71bf3ce2e85?w=300',
    items: ['Navy Midi Dress', 'Pearl Necklace', 'Block Heels', 'Clutch'],
    tags: ['elegant', 'formal', 'comfortable'],
    rating: 5,
    lastWorn: '2024-01-15',
    timesWorn: 3,
    favorite: true,
    notes: 'Perfect for outdoor weddings'
  },
  {
    id: 2,
    name: 'Sunday Church Classic',
    category: 'Conservative',
    season: 'All Season',
    occasion: 'Church',
    image: 'https://images.unsplash.com/photo-1551803091-e20673f05c05?w=300',
    items: ['Knee-length Skirt', 'Blouse', 'Cardigan', 'Low Heels'],
    tags: ['modest', 'classic', 'respectful'],
    rating: 4,
    lastWorn: '2024-01-07',
    timesWorn: 8,
    favorite: false,
    notes: 'Comfortable for long services'
  },
  {
    id: 3,
    name: 'Cozy Home Day',
    category: 'Loungewear',
    season: 'Winter',
    occasion: 'Home',
    image: 'https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=300',
    items: ['Soft Sweater', 'Leggings', 'Fuzzy Slippers', 'Hair Scrunchie'],
    tags: ['comfortable', 'cozy', 'relaxed'],
    rating: 5,
    lastWorn: '2024-01-20',
    timesWorn: 15,
    favorite: true,
    notes: 'Ultimate comfort outfit'
  },
  {
    id: 4,
    name: 'Weekend Adventure',
    category: 'Casual',
    season: 'Summer',
    occasion: 'Casual Outing',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=300',
    items: ['Denim Shorts', 'Tank Top', 'Sneakers', 'Baseball Cap'],
    tags: ['casual', 'sporty', 'fun'],
    rating: 4,
    lastWorn: '2024-01-18',
    timesWorn: 6,
    favorite: false,
    notes: 'Great for walking and exploring'
  }
];

const OutfitOrganizer = ({ isOpen, onClose }: OutfitOrganizerProps) => {
  const [outfits, setOutfits] = useState<OrganizedOutfit[]>(mockOrganizedOutfits);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterOccasion, setFilterOccasion] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const categories = ['all', ...Array.from(new Set(outfits.map(outfit => outfit.category)))];
  const occasions = ['all', ...Array.from(new Set(outfits.map(outfit => outfit.occasion)))];

  const filteredOutfits = outfits.filter(outfit => {
    const matchesSearch = outfit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         outfit.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || outfit.category === filterCategory;
    const matchesOccasion = filterOccasion === 'all' || outfit.occasion === filterOccasion;
    return matchesSearch && matchesCategory && matchesOccasion;
  });

  const sortedOutfits = [...filteredOutfits].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return b.rating - a.rating;
      case 'lastWorn':
        return new Date(b.lastWorn).getTime() - new Date(a.lastWorn).getTime();
      case 'timesWorn':
        return b.timesWorn - a.timesWorn;
      default:
        return 0;
    }
  });

  const toggleFavorite = (id: number) => {
    setOutfits(outfits.map(outfit => 
      outfit.id === id ? { ...outfit, favorite: !outfit.favorite } : outfit
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Outfit Organizer</h2>
            <p className="text-gray-600 dark:text-gray-400">Organize and manage your complete outfit collections</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search outfits by name or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              
              <select 
                value={filterOccasion}
                onChange={(e) => setFilterOccasion(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {occasions.map(occasion => (
                  <option key={occasion} value={occasion}>
                    {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                  </option>
                ))}
              </select>
              
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="lastWorn">Sort by Last Worn</option>
                <option value="timesWorn">Sort by Times Worn</option>
              </select>

              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-owis-sage text-white' : ''}
                >
                  <Grid size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-owis-sage text-white' : ''}
                >
                  <List size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Outfits Display */}
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {sortedOutfits.map((outfit) => (
              <Card 
                key={outfit.id} 
                className={`group hover:shadow-lg transition-all duration-300 ${
                  viewMode === 'list' ? 'flex flex-row' : ''
                }`}
              >
                <div className={viewMode === 'list' ? 'w-32 flex-shrink-0' : 'aspect-[3/4]'}>
                  <img
                    src={outfit.image}
                    alt={outfit.name}
                    className="w-full h-full object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{outfit.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{outfit.occasion}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(outfit.id)}
                      className="ml-2 p-1 h-auto"
                    >
                      <Star 
                        size={16} 
                        className={outfit.favorite ? "fill-yellow-500 text-yellow-500" : "text-gray-400"} 
                      />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">{outfit.category}</Badge>
                      <Badge variant="outline" className="text-xs">{outfit.season}</Badge>
                    </div>

                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < outfit.rating ? "text-yellow-500 fill-current" : "text-gray-300"} 
                        />
                      ))}
                      <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                        ({outfit.rating}/5)
                      </span>
                    </div>

                    {viewMode === 'grid' && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <p>Worn: {outfit.timesWorn} times</p>
                        <p>Last: {new Date(outfit.lastWorn).toLocaleDateString()}</p>
                        <p>{outfit.items.length} pieces</p>
                      </div>
                    )}

                    {viewMode === 'list' && (
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <p>Worn: {outfit.timesWorn}x</p>
                        <p>Items: {outfit.items.length}</p>
                        <p>Last: {new Date(outfit.lastWorn).toLocaleDateString()}</p>
                        <p>Rating: {outfit.rating}/5</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {outfit.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} className="text-xs bg-owis-gold/10 text-owis-gold">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {outfit.notes && viewMode === 'list' && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic line-clamp-2">
                        "{outfit.notes}"
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sortedOutfits.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">No outfits found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutfitOrganizer;
