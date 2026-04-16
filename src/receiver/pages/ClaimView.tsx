import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../donor/components/ui/Card/Card';
import { Button } from '../../donor/components/ui/Button/Button';
import { MapPin, Phone, ShieldCheck, ArrowLeft, CheckCircle2, Zap } from 'lucide-react';
import { LeafletMap } from '../../donor/components/ui/LeafletMap/LeafletMap';
import { supabase } from '../../lib/supabase';
import '../styles/Explore.css';

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
  { id: '1', name: 'KFC Fried Chicken Bucket', type: 'Fast Food', quantity: '15 pieces', distance: '0.8 km', expiry: '30 mins', donor: 'KFC', urgencyScore: 95, urgencyLevel: 'high', urgencyLabel: '⚡ High Priority - 30 min', verified: true, demand: 'Very High', phone: '+91 88776 65544' },
  { id: '2', name: 'Haldiram\'s Paneer Butter Masala', type: 'Main Course', quantity: '20 portions', distance: '0.4 km', expiry: '45 mins', donor: 'Haldiram\'s', urgencyScore: 90, urgencyLevel: 'high', urgencyLabel: '⚡ High - 45 min', verified: true, demand: 'Very High', phone: '+91 91234 56789' },
  { id: '5', name: 'Haldiram\'s Special Thali', type: 'North Indian', quantity: '20 portions', distance: '0.4 km', expiry: '45 mins', donor: 'Haldiram\'s', urgencyScore: 92, urgencyLevel: 'high', urgencyLabel: '⚡ High Priority - 45 min', verified: true, demand: 'Very High', phone: '+91 95555 44444' },
  { id: '7', name: 'Steamed Basmati Rice', type: 'Main Course', quantity: '40 portions', distance: '0.5 km', expiry: '2 hours', donor: 'Royal Biryani House', urgencyScore: 88, urgencyLevel: 'high', urgencyLabel: '⚡ High - 2 hr', verified: true, demand: 'High', phone: '+91 98765 43210' },
  { id: '8', name: 'Mixed Vegetable Sambar', type: 'Side Dish', quantity: '2 large containers', distance: '1.1 km', expiry: '3 hours', donor: 'Udupi Point', urgencyScore: 75, urgencyLevel: 'medium', urgencyLabel: '⏰ Medium - 3 hr', verified: true, demand: 'Medium', phone: '+91 99887 76655' },
];

export const ClaimView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<'details' | 'logistics'>('details');

  useEffect(() => {
    const fetchItem = async () => {
      // 1. Try fetching from Supabase first
      const { data } = await supabase
        .from('donations')
        .select('*, profiles(organization_name, phone_number)')
        .eq('id', id)
        .single();

      if (data) {
        setItem({
          id: data.id,
          name: data.food_name,
          type: data.category,
          quantity: `${data.quantity_value} ${data.quantity_unit}`,
          distance: '0.4 km',
          expiry: new Date(data.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          donor: data.profiles?.organization_name || 'Anonymous Donor',
          urgencyScore: data.urgency_score,
          urgencyLevel: data.urgency_score > 90 ? 'high' : data.urgency_score > 60 ? 'medium' : 'low',
          urgencyLabel: `⚡ ${data.is_disaster ? 'SOS EMERGENCY' : 'High Priority'} - ${new Date(data.expiry_time).toLocaleTimeString()}`,
          verified: true,
          demand: 'High',
          phone: data.profiles?.phone_number || '+91 98765 43210'
        });
        return;
      }

      // 2. Fallback to mock data for hardcoded IDs
      const found = MOCK_FOOD_ITEMS.find(i => i.id === id);
      if (found) setItem(found);
    };

    fetchItem();
  }, [id]);

  if (!item) return <div className="p-12 text-center" style={{ background: '#f8fafc', height: '100vh' }}>Loading contribution details...</div>;

  return (
    <div className="claim-page-wrapper" style={{ minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* TOP NAVBAR AREA */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          <button 
            onClick={() => navigate('/explore')} 
            style={{ 
              background: 'white', 
              border: 'none', 
              padding: '12px', 
              borderRadius: '12px', 
              cursor: 'pointer', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginRight: '24px'
            }}
          >
            <ArrowLeft size={20} color="#333" />
          </button>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: 0, color: '#1a1a1a' }}>
            Claim <span style={{ color: '#4f633d' }}>Food</span>
          </h1>
        </div>

        {/* TWO COLUMN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* LEFT SIDE: DETAILS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4f633d', letterSpacing: '1px', marginBottom: '24px' }}>DONOR DETAILS</h3>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0 0 24px', color: '#1a1a1a' }}>{item.donor}</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>FOOD ITEM</p>
                  <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#333' }}>{item.name}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>AVAILABLE</p>
                  <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#4f633d' }}>{item.quantity}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>DISTANCE</p>
                  <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#333' }}>{item.distance}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>EXPIRY</p>
                  <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>{item.expiry}</p>
                </div>
              </div>

              <div style={{ marginTop: '32px', padding: '16px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, color: '#333' }}>
                <Phone size={18} color="#4f633d" /> {item.phone}
              </div>
            </Card>

            <Card style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#666', letterSpacing: '1px', marginBottom: '20px' }}>RECEIVER (NGO)</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', background: '#4f633d', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.2rem' }}>R</div>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 800, color: '#1a1a1a' }}>Robin NGO</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#4f633d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={16} /> Verified Partner
                  </p>
                </div>
              </div>
            </Card>

            <Card style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#666', letterSpacing: '1px', marginBottom: '24px' }}>DONATION LIFECYCLE</h3>
              <div className="flow-tracker" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {(() => {
                  const flowSteps = [
                    { name: 'Upload', status: 'completed' },
                    { name: 'Match', status: 'completed' },
                    { name: 'Claim', status: step === 'details' ? 'active' : 'completed' },
                    { name: 'Pickup', status: step === 'logistics' ? 'active' : 'pending' },
                    { name: 'Feedback', status: 'pending' },
                  ];

                  return flowSteps.map((s, i) => (
                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
                      <div 
                        style={{
                          width: '42px', height: '42px', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1rem', fontWeight: 800, zIndex: 1,
                          backgroundColor: s.status === 'completed' ? '#4f633d' : s.status === 'active' ? '#f4f7f2' : '#f5f5f5',
                          color: s.status === 'completed' ? 'white' : s.status === 'active' ? '#4f633d' : '#999',
                          border: s.status === 'active' ? '2px solid #4f633d' : s.status === 'pending' ? '2px solid #e0e0e0' : '2px solid transparent',
                        }}
                      >
                        {s.status === 'completed' ? <CheckCircle2 size={20} /> :
                         s.name === 'Claim' && s.status === 'active' ? <Zap size={20} /> : i + 1}
                      </div>
                      <div style={{ flex: 1, fontSize: '1.2rem', fontWeight: 800, color: s.status === 'pending' ? '#666' : '#1a1a1a' }}>
                        {s.name}
                      </div>
                      {i < flowSteps.length - 1 && (
                        <div 
                          style={{
                            position: 'absolute', left: '20px', top: '42px',
                            width: '2px', height: '20px',
                            background: s.status === 'completed' ? '#4f633d' : '#e0e0e0',
                            zIndex: 0
                          }} 
                        />
                      )}
                    </div>
                  ));
                })()}
              </div>
            </Card>
          </div>

          {/* RIGHT SIDE: INTERACTIVE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card style={{ background: 'white', borderRadius: '24px', padding: 0, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
              <div style={{ height: '360px', position: 'relative' }}>
                <LeafletMap location={item.donor} />
                <div style={{ position: 'absolute', bottom: '24px', right: '24px', zIndex: 1000 }}>
                   <Button 
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.donor)}`)}
                    style={{ background: 'white', color: '#333', border: '1px solid #ddd', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontWeight: 700 }}
                   >
                     <MapPin size={16} style={{ marginRight: '8px' }} /> Open in Google Maps
                   </Button>
                </div>
              </div>
            </Card>

            {step === 'details' ? (
              <Card className="animate-fade-in" style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#666', letterSpacing: '1px', marginBottom: '24px' }}>CONFIRM QUANTITY</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a1a1a', minWidth: '70px' }}>{quantity}</div>
                  <input 
                    type="range" 
                    min="1" 
                    max={parseInt(item.quantity) || 20} 
                    value={quantity} 
                    onChange={(e) => setQuantity(parseInt(e.target.value))} 
                    style={{ flex: 1, accentColor: '#4f633d', cursor: 'pointer' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <Button variant="outline" fullWidth style={{ borderRadius: '14px', height: '54px', fontWeight: 700 }} onClick={() => navigate('/explore')}>Go Back</Button>
                  <Button fullWidth style={{ borderRadius: '14px', height: '54px', fontWeight: 700 }} onClick={() => setStep('logistics')}>Confirm Claim</Button>
                </div>
              </Card>
            ) : (
              <Card className="animate-fade-in" style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#666', letterSpacing: '1px', marginBottom: '24px' }}>LOGISTICS SUPPORT</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Button 
                    variant="glass" 
                    style={{ height: 'auto', padding: '20px', justifyContent: 'flex-start', border: '2px solid #4f633d', background: 'rgba(79,99,61,0.03)', borderRadius: '16px' }}
                    onClick={() => alert(`Successfully claimed ${quantity} portions for Self-Pickup!`)}
                  >
                    <div style={{ fontSize: '1.6rem', marginRight: '20px' }}>🏠</div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontWeight: 800, margin: '0 0 2px', color: '#1a1a1a' }}>Self Pickup</p>
                      <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: 0, fontWeight: 600 }}>I'll handle transportation</p>
                    </div>
                  </Button>

                  <div style={{ textAlign: 'center', margin: '8px 0', fontSize: '0.75rem', fontWeight: 800, color: '#999', letterSpacing: '1px' }}>OR BOOK PARTNER</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <Button variant="outline" style={{ borderRadius: '12px', height: '50px', fontWeight: 700 }} onClick={() => window.open('https://ola.com')}>🚕 Ola</Button>
                    <Button variant="outline" style={{ borderRadius: '12px', height: '50px', fontWeight: 700 }} onClick={() => window.open('https://rapido.com')}>🏍️ Rapido</Button>
                    <Button variant="outline" style={{ borderRadius: '12px', height: '50px', fontWeight: 700 }} onClick={() => window.open('https://uber.com')}>🚙 Uber</Button>
                  </div>
                  
                  <Button variant="ghost" fullWidth style={{ marginTop: '16px', color: '#666', fontWeight: 700 }} onClick={() => setStep('details')}>
                    ← Change Quantity
                  </Button>
                </div>
              </Card>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
