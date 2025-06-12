
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Cloud, Heart, Church, Home, Users, Star, MapPin, Sparkles } from 'lucide-react';

const OutfitGenerator = () => {
  const [selectedOccasion, setSelectedOccasion] = useState('work');
  
  const occasions = [
    { id: 'work', label: 'Work Meeting', icon: '💼', color: 'from-blue-500 to-blue-600' },
    { id: 'casual', label: 'Casual Day', icon: '👕', color: 'from-green-500 to-green-600' },
    { id: 'formal', label: 'Formal Event', icon: '👔', color: 'from-purple-500 to-purple-600' },
    { id: 'weekend', label: 'Weekend Out', icon: '🌟', color: 'from-orange-500 to-orange-600' },
    { id: 'wedding', label: 'Wedding', icon: '💒', color: 'from-pink-500 to-rose-500' },
    { id: 'church', label: 'Church', icon: '⛪', color: 'from-indigo-500 to-indigo-600' },
    { id: 'home', label: 'Home Comfort', icon: '🏠', color: 'from-emerald-500 to-emerald-600' },
    { id: 'date', label: 'Date Night', icon: '💕', color: 'from-red-500 to-red-600' }
  ];

  const outfitSuggestions = {
    work: {
      items: ['Navy Blazer', 'White Silk Blouse', 'Charcoal Trousers', 'Black Leather Loafers'],
      confidence: 94,
      sustainability: 'High',
      weather: 'Perfect for 72°F partly cloudy',
      image: 'https://images.unsplash.com/photo-1551803091-e20673f05c05?w=300'
    },
    casual: {
      items: ['Denim Jacket', 'Striped T-Shirt', 'Dark Jeans', 'White Sneakers'],
      confidence: 87,
      sustainability: 'Medium',
      weather: 'Great for sunny weather',
      image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=300'
    },
    formal: {
      items: ['Black Suit', 'Crisp White Shirt', 'Silk Tie', 'Oxford Shoes'],
      confidence: 96,
      sustainability: 'High',
      weather: 'Indoor event ready',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'
    },
    weekend: {
      items: ['Cashmere Sweater', 'High-waisted Jeans', 'Ankle Boots', 'Crossbody Bag'],
      confidence: 91,
      sustainability: 'High',
      weather: 'Comfortable for all day',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300'
    },
    wedding: {
      items: ['Elegant Midi Dress', 'Pearl Necklace', 'Block Heels', 'Small Clutch'],
      confidence: 93,
      sustainability: 'High',
      weather: 'Perfect for outdoor ceremony',
      image: 'https://images.unsplash.com/photo-1566479179817-a71bf3ce2e85?w=300'
    },
    church: {
      items: ['Modest Blouse', 'Knee-length Skirt', 'Light Cardigan', 'Low Heels'],
      confidence: 89,
      sustainability: 'High',
      weather: 'Respectful and comfortable',
      image: 'https://images.unsplash.com/photo-1544966503-7ba37778b4d7?w=300'
    },
    home: {
      items: ['Soft Loungewear', 'Cozy Slippers', 'Hair Scrunchie', 'Warm Socks'],
      confidence: 95,
      sustainability: 'Medium',
      weather: 'Maximum comfort at home',
      image: 'https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=300'
    },
    date: {
      items: ['Silk Dress', 'Statement Earrings', 'Heeled Sandals', 'Evening Bag'],
      confidence: 92,
      sustainability: 'High',
      weather: 'Perfect for romantic evening',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300'
    }
  };

  const currentOutfit = outfitSuggestions[selectedOccasion as keyof typeof outfitSuggestions];

  return (
    <section className="py-20 bg-gradient-to-br from-owis-mint to-owis-cream">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-owis-forest mb-6">
            AI Outfit Generator
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Let our advanced AI curate the perfect outfit for any occasion, 
            considering weather, style preferences, and sustainability.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Controls */}
          <div className="space-y-8 animate-fade-in">
            <div>
              <h3 className="text-2xl font-heading font-semibold text-owis-charcoal mb-6">
                Choose Your Occasion
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {occasions.map((occasion) => (
                  <button
                    key={occasion.id}
                    onClick={() => setSelectedOccasion(occasion.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedOccasion === occasion.id
                        ? 'border-owis-gold bg-owis-gold/10 text-owis-forest shadow-lg scale-105'
                        : 'border-gray-200 hover:border-owis-gold/50 hover:bg-white/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{occasion.icon}</div>
                    <div className="font-medium text-sm">{occasion.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground bg-white/60 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Today, 2:00 PM</span>
              </div>
              <div className="flex items-center space-x-2">
                <Cloud className="h-4 w-4" />
                <span>72°F, Partly Cloudy</span>
              </div>
            </div>

            <Button 
              size="lg"
              className="w-full bg-gradient-to-r from-owis-gold to-owis-bronze hover:from-owis-gold-dark hover:to-owis-bronze-dark text-owis-forest font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate New Outfit
            </Button>
          </div>

          {/* Outfit Display */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl animate-scale-in border border-white/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-heading font-semibold text-owis-charcoal">
                Perfect Match
              </h3>
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full ${
                  currentOutfit.confidence > 90 ? 'bg-green-500' : 'bg-owis-gold'
                }`}></div>
                <span className="text-sm font-medium text-owis-charcoal">
                  {currentOutfit.confidence}% Match
                </span>
              </div>
            </div>

            {/* Outfit Image */}
            <div className="mb-6 rounded-lg overflow-hidden">
              <img 
                src={currentOutfit.image} 
                alt="Outfit suggestion"
                className="w-full h-64 object-cover"
              />
            </div>

            <div className="space-y-4 mb-6">
              {currentOutfit.items.map((item, index) => (
                <div 
                  key={item}
                  className="flex items-center space-x-4 p-3 bg-gradient-to-r from-white/60 to-white/40 rounded-lg animate-fade-in border border-white/50"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-owis-charcoal">{item}</div>
                    <div className="text-sm text-muted-foreground">Last worn 3 days ago</div>
                  </div>
                  <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Sustainable
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sustainability Score:</span>
                <span className="font-medium text-green-600">{currentOutfit.sustainability}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weather Compatibility:</span>
                <span className="font-medium text-owis-charcoal">{currentOutfit.weather}</span>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button variant="outline" className="flex-1 border-owis-sage text-owis-sage hover:bg-owis-sage hover:text-white">
                Save Outfit
              </Button>
              <Button variant="outline" className="flex-1 border-owis-gold text-owis-gold hover:bg-owis-gold hover:text-owis-forest">
                Share Look
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OutfitGenerator;
