import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MapPin, Phone, X, ShieldCheck } from 'lucide-react';
import { LeafletMap } from '../components/ui/LeafletMap';
import './Explore.css'; // Reusing styles for consistency

interface FoodItem {
  id: string;
  name: string;
  type: string;
  quantity: string;
  distance: string;
  expiry: string;
  donor: string;
  urgencyScore: number;
  urgencyLevel: 'high' | 'medium' | 'low';
  urgencyLabel: string;
  verified: boolean;
  demand: string;
  phone?: string;
}

const MOCK_FOOD_ITEMS: FoodItem[] = [
  { id: '7', name: 'Steamed Basmati Rice', type: 'Main Course', quantity: '40 portions', distance: '0.5 km', expiry: '2 hours', donor: 'Royal Biryani House', urgencyScore: 88, urgencyLevel: 'high', urgencyLabel: '⚡ High - 2 hr', verified: true, demand: 'High', phone: '+91 98765 43210' },
  { id: '8', name: 'Mixed Vegetable Sambar', type: 'Side Dish', quantity: '2 large containers', distance: '1.1 km', expiry: '3 hours', donor: 'Udupi Point', urgencyScore: 75, urgencyLevel: 'medium', urgencyLabel: '⏰ Medium - 3 hr', verified: true, demand: 'Medium', phone: '+91 99887 76655' },
  { id: '1', name: 'KFC Fried Chicken Bucket', type: 'Fast Food', quantity: '15 pieces', distance: '0.8 km', expiry: '30 mins', donor: 'KFC', urgencyScore: 95, urgencyLevel: 'high', urgencyLabel: '⚡ High Priority - 30 min', verified: true, demand: 'Very High', phone: '+91 88776 65544' },
  { id: '2', name: 'Haldiram\'s Paneer Butter Masala', type: 'Main Course', quantity: '20 portions', distance: '0.4 km', expiry: '45 mins', donor: 'Haldiram\'s', urgencyScore: 90, urgencyLevel: 'high', urgencyLabel: '⚡ High - 45 min', verified: true, demand: 'Very High', phone: '+91 91234 56789' },
  { id: '9', name: 'Veg Dum Biryani', type: 'Main Course', quantity: '10 portions', distance: '1.2 km', expiry: '4 hours', donor: 'Taj Hotel', urgencyScore: 60, urgencyLevel: 'medium', urgencyLabel: '⏰ Medium - 4 hr', verified: true, demand: 'High', phone: '+91 98888 77777' },
  { id: '3', name: 'Masala Dosa & Sambar', type: 'South Indian', quantity: '5 portions', distance: '2.5 km', expiry: '1 hour', donor: 'MTR (Mavalli Tiffin Room)', urgencyScore: 85, urgencyLevel: 'high', urgencyLabel: '⚡ High Priority - 1 hr', verified: false, demand: 'Medium', phone: '+91 97777 66666' },
  { id: '4', name: 'McDonald\'s Happy Meals', type: 'Fast Food', quantity: '3 meals', distance: '3.1 km', expiry: '5 hours', donor: 'McDonald\'s', urgencyScore: 30, urgencyLevel: 'low', urgencyLabel: '✅ Low Priority - 5 hr', verified: true, demand: 'Low', phone: '+91 96666 55555' },
  { id: '5', name: 'Paneer Butter Masala', type: 'North Indian', quantity: '20 portions', distance: '0.4 km', expiry: '45 mins', donor: 'Haldiram\'s', urgencyScore: 92, urgencyLevel: 'high', urgencyLabel: '⚡ High Priority - 45 min', verified: true, demand: 'Very High', phone: '+91 95555 44444' },
  { id: '6', name: 'Chole Bhature', type: 'North Indian', quantity: '8 portions', distance: '1.8 km', expiry: '8 hours', donor: 'Bikanerwala', urgencyScore: 20, urgencyLevel: 'low', urgencyLabel: '✅ Low Priority - 8 hr', verified: true, demand: 'Moderate', phone: '+91 94444 33333' },
];

export const ClaimView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<'details' | 'logistics' | 'success'>('details');

  useEffect(() => {
    const found = MOCK_FOOD_ITEMS.find(i => i.id === id);
    if (found) setItem(found);
  }, [id]);

  if (!item) return <div className="p-8 text-center">Loading contribution details...</div>;

  const handleConfirmDetails = () => setStep('logistics');
  const handleFinalConfirm = () => {
    alert(`Success! Your claim for ${quantity} portions has been registered.`);
    navigate('/explore');
  };

  return (
    <div className="claim-page-wrapper">
      <Card className="full-claim-card glass">
        {step === 'details' ? (
          <>
            <div className="claim-header-row">
              <h1 className="claim-title-main">Claim Donation</h1>
              <button className="close-page-btn" onClick={() => navigate('/explore')}><X size={24} /></button>
            </div>

            <div className="claim-info-beige-box">
              <div className="beige-col">
                <h3 className="beige-label">DONOR DETAILS</h3>
                <p><strong>Name:</strong> {item.donor}</p>
                <p><strong>Item:</strong> {item.name}</p>
                <p><strong>Available:</strong> <span className="portions-bold">{item.quantity}</span></p>
                <a href={`tel:${item.phone}`} className="beige-phone"><Phone size={14} /> {item.phone}</a>
              </div>
              <div className="beige-divider"></div>
              <div className="beige-col">
                <h3 className="beige-label">LOGISTICS INFO</h3>
                <p><strong>Distance:</strong> {item.distance}</p>
                <p><strong>Expires In:</strong> <span className="expiry-red">{item.expiry}</span></p>
                <p><strong>Demand:</strong> {item.demand}</p>
                <a href="tel:+919822100334" className="beige-phone"><Phone size={14} /> +91 98221 00334</a>
              </div>
            </div>

            <div className="claim-map-wrapper">
              <LeafletMap location={item.donor} />
            </div>

            <div className="claim-quantity-section">
              <h4 className="quantity-question">How much quantity do you need?</h4>
              <div className="quantity-picker-row">
                <div className="quantity-val-box">{quantity}</div>
                <input 
                  type="range" 
                  min="1" 
                  max={parseInt(item.quantity) || 20} 
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="pretty-slider"
                />
              </div>
              <div className="quantity-limits">
                <span>1</span>
                <span>Max: {item.quantity}</span>
              </div>
            </div>

            <div className="claim-actions-row">
              <Button variant="outline" className="btn-cancel" onClick={() => navigate('/explore')}>Close</Button>
              <Button className="btn-confirm" onClick={handleConfirmDetails}>Confirm Claim</Button>
            </div>

            <Button 
              fullWidth 
              variant="outline" 
              className="btn-google-maps"
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.donor)}`, '_blank')}
            >
              <MapPin size={18} /> Open in Google Maps
            </Button>
          </>
        ) : (
          <div className="logistics-step-view">
             <h1 className="claim-title-main">Logistics Support</h1>
             <p className="logistics-text">Choose your preferred pickup method from <strong>{item.donor}</strong></p>
             
             <div className="logistics-options">
               <Button variant="glass" className="logistics-btn self" onClick={handleFinalConfirm}>
                 <span className="emoji-big">🏠</span>
                 <div className="btn-txt">
                   <strong>Self Pickup</strong>
                   <span>I have my own transport</span>
                 </div>
               </Button>
               
               <div className="or-divider">OR BOOK THROUGH PARTNERS</div>
               
               <div className="partner-grid">
                 <Button variant="outline" onClick={() => window.open('https://ola.com')}>🚕 Ola</Button>
                 <Button variant="outline" onClick={() => window.open('https://rapido.com')}>🏍️ Rapido</Button>
                 <Button variant="outline" onClick={() => window.open('https://uber.com')}>🚙 Uber</Button>
               </div>
             </div>

             <Button fullWidth className="btn-confirm" style={{ marginTop: '24px' }} onClick={handleFinalConfirm}>
               Done / Skip
             </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
