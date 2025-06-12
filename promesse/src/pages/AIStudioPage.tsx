
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AIOutfitAnalyzer from '@/components/AIOutfitAnalyzer';
import AIEventRecommender from '@/components/AIEventRecommender';
import AITrendForecasting from '@/components/AITrendForecasting';
import AIStyleInsights from '@/components/AIStyleInsights';

// Mock wardrobe data for the event recommender
const mockWardrobeItems = [
  { id: 1, name: 'Elegant Navy Blazer', category: 'outerwear', color: 'navy', brand: "Ralph Lauren", price: 280.00, tags: ['formal', 'work', 'versatile'], favorite: true, timesWorn: 15 },
  { id: 2, name: 'Silk White Blouse', category: 'tops', color: 'white', brand: 'Theory', price: 185.00, tags: ['office', 'elegant', 'luxury'], favorite: true, timesWorn: 12 },
  { id: 3, name: 'Designer Black Jeans', category: 'bottoms', color: 'black', brand: 'Citizens of Humanity', price: 195.00, tags: ['casual', 'versatile', 'premium'], favorite: false, timesWorn: 22 },
  { id: 4, name: 'Stunning Red Dress', category: 'dresses', color: 'red', brand: 'Diane von Furstenberg', price: 385.00, tags: ['party', 'elegant', 'statement'], favorite: true, timesWorn: 5 },
  { id: 5, name: 'Luxury Leather Boots', category: 'shoes', color: 'black', brand: 'Saint Laurent', price: 650.00, tags: ['luxury', 'edgy', 'statement'], favorite: true, timesWorn: 8 },
  { id: 6, name: 'Diamond Tennis Necklace', category: 'accessories', color: 'silver', brand: 'Tiffany & Co', price: 1200.00, tags: ['luxury', 'elegant', 'formal'], favorite: true, timesWorn: 3 },
  { id: 7, name: 'Cashmere Cardigan', category: 'outerwear', color: 'beige', brand: 'Brunello Cucinelli', price: 890.00, tags: ['luxury', 'cozy', 'elegant'], favorite: false, timesWorn: 6 },
  { id: 8, name: 'Vintage Hermès Scarf', category: 'accessories', color: 'multicolor', brand: 'Hermès', price: 420.00, tags: ['luxury', 'vintage', 'statement'], favorite: true, timesWorn: 4 },
];

const AIStudioPage = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/ai-studio/analyzer" replace />} />
      <Route path="/analyzer" element={<AIOutfitAnalyzer />} />
      <Route path="/event-recommender" element={<AIEventRecommender wardrobeItems={mockWardrobeItems} />} />
      <Route path="/insights" element={<AIStyleInsights />} />
      <Route path="/trends" element={<AITrendForecasting />} />
    </Routes>
  );
};

export default AIStudioPage;
