
import React, { useState } from 'react';
import { Calendar, Church, Home, Heart, Users, MapPin, Clock, Star, Save, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface OccasionPlannerProps {
  isOpen: boolean;
  onClose: () => void;
}

const occasions = [
  { id: 'wedding', label: 'Wedding', icon: Heart, color: 'from-pink-500 to-rose-500', description: 'Elegant formal wear' },
  { id: 'church', label: 'Church', icon: Church, color: 'from-blue-500 to-indigo-500', description: 'Modest and respectful' },
  { id: 'home', label: 'Home/Comfort', icon: Home, color: 'from-green-500 to-emerald-500', description: 'Relaxed and cozy' },
  { id: 'casual', label: 'Casual Outing', icon: Users, color: 'from-orange-500 to-amber-500', description: 'Fun and comfortable' },
  { id: 'date', label: 'Date Night', icon: Star, color: 'from-purple-500 to-violet-500', description: 'Stylish and attractive' },
  { id: 'work', label: 'Professional', icon: MapPin, color: 'from-slate-600 to-slate-700', description: 'Business appropriate' }
];

const mockOutfits = {
  wedding: [
    { name: 'Elegant Navy Dress', image: 'https://images.unsplash.com/photo-1566479179817-a71bf3ce2e85?w=300', accessories: ['Pearl Necklace', 'Block Heels'] },
    { name: 'Floral Midi Dress', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300', accessories: ['Gold Earrings', 'Nude Pumps'] }
  ],
  church: [
    { name: 'Modest Blouse & Skirt', image: 'https://images.unsplash.com/photo-1551803091-e20673f05c05?w=300', accessories: ['Simple Cross', 'Low Heels'] },
    { name: 'Knee-length Dress', image: 'https://images.unsplash.com/photo-1544966503-7ba37778b4d7?w=300', accessories: ['Cardigan', 'Flats'] }
  ],
  home: [
    { name: 'Soft Loungewear Set', image: 'https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=300', accessories: ['Cozy Slippers', 'Hair Tie'] },
    { name: 'Comfortable Joggers', image: 'https://images.unsplash.com/photo-1566479179817-a71bf3ce2e85?w=300', accessories: ['Soft T-shirt', 'Socks'] }
  ],
  casual: [
    { name: 'Denim & T-shirt', image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=300', accessories: ['Sneakers', 'Baseball Cap'] },
    { name: 'Sundress', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300', accessories: ['Sandals', 'Sun Hat'] }
  ]
};

const OccasionPlanner = ({ isOpen, onClose }: OccasionPlannerProps) => {
  const [selectedOccasion, setSelectedOccasion] = useState<string>('');
  const [eventDetails, setEventDetails] = useState({ name: '', date: '', location: '', notes: '' });
  const [selectedOutfit, setSelectedOutfit] = useState<any>(null);
  const { toast } = useToast();

  const handleSaveOutfit = () => {
    const savedOutfits = JSON.parse(localStorage.getItem('occasionOutfits') || '[]');
    const newOutfit = {
      id: Date.now(),
      occasion: selectedOccasion,
      eventDetails,
      outfit: selectedOutfit,
      createdAt: new Date().toISOString()
    };
    
    savedOutfits.push(newOutfit);
    localStorage.setItem('occasionOutfits', JSON.stringify(savedOutfits));
    
    toast({
      title: "Outfit Saved!",
      description: `Perfect outfit for ${eventDetails.name || selectedOccasion} has been saved.`,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Occasion Planner</h2>
            <p className="text-gray-600 dark:text-gray-400">Plan perfect outfits for every special moment</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Occasion Selection */}
          {!selectedOccasion && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Choose Your Occasion</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {occasions.map((occasion) => (
                  <Card 
                    key={occasion.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                    onClick={() => setSelectedOccasion(occasion.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${occasion.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <occasion.icon className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">{occasion.label}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{occasion.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Event Details */}
          {selectedOccasion && !selectedOutfit && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setSelectedOccasion('')}>← Back</Button>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {occasions.find(o => o.id === selectedOccasion)?.label} Event Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Event name (e.g., Sarah's Wedding)"
                  value={eventDetails.name}
                  onChange={(e) => setEventDetails({...eventDetails, name: e.target.value})}
                />
                <Input
                  type="date"
                  value={eventDetails.date}
                  onChange={(e) => setEventDetails({...eventDetails, date: e.target.value})}
                />
                <Input
                  placeholder="Location"
                  value={eventDetails.location}
                  onChange={(e) => setEventDetails({...eventDetails, location: e.target.value})}
                />
                <Input
                  placeholder="Special notes"
                  value={eventDetails.notes}
                  onChange={(e) => setEventDetails({...eventDetails, notes: e.target.value})}
                />
              </div>

              {/* Outfit Recommendations */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Perfect Outfits for This Occasion</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockOutfits[selectedOccasion as keyof typeof mockOutfits]?.map((outfit, index) => (
                    <Card 
                      key={index}
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                      onClick={() => setSelectedOutfit(outfit)}
                    >
                      <div className="aspect-[3/4] overflow-hidden rounded-t-lg">
                        <img 
                          src={outfit.image} 
                          alt={outfit.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">{outfit.name}</h5>
                        <div className="flex flex-wrap gap-1">
                          {outfit.accessories.map((accessory, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {accessory}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Outfit Details & Save */}
          {selectedOutfit && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setSelectedOutfit(null)}>← Back</Button>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Outfit Details</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={selectedOutfit.image} 
                    alt={selectedOutfit.name}
                    className="w-full aspect-[3/4] object-cover rounded-lg"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedOutfit.name}</h4>
                    <p className="text-gray-600 dark:text-gray-400">Perfect for {eventDetails.name || selectedOccasion}</p>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Complete Look Includes:</h5>
                    <div className="space-y-2">
                      {selectedOutfit.accessories.map((accessory: string, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-owis-gold rounded-full"></div>
                          <span className="text-gray-700 dark:text-gray-300">{accessory}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {eventDetails.date && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar size={16} />
                      <span>{new Date(eventDetails.date).toLocaleDateString()}</span>
                    </div>
                  )}

                  {eventDetails.location && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin size={16} />
                      <span>{eventDetails.location}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSaveOutfit} className="flex-1 bg-owis-gold hover:bg-owis-gold-dark text-owis-forest">
                      <Save size={16} className="mr-2" />
                      Save Outfit
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Share2 size={16} className="mr-2" />
                      Share Look
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OccasionPlanner;
