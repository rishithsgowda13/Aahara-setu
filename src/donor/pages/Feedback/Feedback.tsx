import React, { useState } from 'react';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { Star, MessageSquare, ThumbsUp, Award } from 'lucide-react';
import './Feedback.css';

const KINDNESS_MILESTONES = [
  { threshold: 0, label: 'Newcomer 🌱', color: '#8BA194' },
  { threshold: 50, label: 'Helper 🤝', color: '#6cbf5e' },
  { threshold: 150, label: 'Contributor 🌟', color: '#f59e0b' },
  { threshold: 300, label: 'Champion 🏆', color: '#4F633D' },
];

export const Feedback: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState('');
  const kindnessScore = 210;
  const milestone = KINDNESS_MILESTONES.slice().reverse().find(m => kindnessScore >= m.threshold)!;
  const nextMilestone = KINDNESS_MILESTONES.find(m => m.threshold > kindnessScore);
  const progress = nextMilestone
    ? ((kindnessScore - milestone.threshold) / (nextMilestone.threshold - milestone.threshold)) * 100
    : 100;

  const handleSubmit = () => {
    if (rating === 0) return;
    setSubmitted(true);
  };

  return (
    <div className="feedback-page">
      <div className="feedback-header">
        <h1 className="page-title">Community <span className="gradient-text">Trust & Impact</span></h1>
        <p className="page-subtitle">Track your contributions and help us optimize the redistribution network.</p>
      </div>

      <div className="feedback-layout">
        <Card className="kindness-card hover-lift">
          <div className="kindness-header">
            <Award size={20} />
            <span>KINDNESS SCORE</span>
          </div>

          <div className="kindness-score-circle">
            <div className="ks-number">{kindnessScore}</div>
            <div className="ks-label">REDISTRIBUTION XP</div>
          </div>

          <div className="ks-milestone-badge">
            {milestone.label}
          </div>

          <div className="ks-progress-wrap">
            <div className="ks-progress-bar">
              <div className="ks-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            {nextMilestone && (
              <p className="ks-progress-hint">{nextMilestone.threshold - kindnessScore} XP to reach {nextMilestone.label}</p>
            )}
          </div>

          <div className="ks-stats-row">
            <div className="ks-stat">
              <div className="ks-stat-val">12</div>
              <div className="ks-stat-lbl">RESCUES DONE</div>
            </div>
            <div className="ks-stat">
              <div className="ks-stat-val">4.9 ⭐</div>
              <div className="ks-stat-lbl">PARTNER RATING</div>
            </div>
          </div>
        </Card>

        {/* Rating Form */}
        <div className="feedback-form-section">
          {submitted ? (
            <Card className="thank-you-card hover-lift">
              <div className="ty-icon">🎊</div>
              <h3>Review Published!</h3>
              <p>Your feedback strengthens the network's integrity. We've updated your Kindness profile.</p>
              <div className="ty-score-gain">
                <Award size={18} />
                <span>+10 EXTRA XP GAINED</span>
              </div>
              <Button style={{ marginTop: '20px' }} onClick={() => { setSubmitted(false); setRating(0); }}>NEW REVIEW</Button>
            </Card>
          ) : (
            <Card className="rating-card">
              <h3>Quality Audit</h3>
              <p className="card-desc">Help us maintain absolute food safety and logistics efficiency.</p>

              <div className="category-row">
                {['Accuracy', 'Speed', 'Communication', 'Packaging'].map(cat => (
                  <button
                    key={cat}
                    className={`cat-chip ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                    type="button"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`star-btn ${star <= (hover || rating) ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    type="button"
                  >
                    <Star size={48} fill={star <= (hover || rating) ? '#f59e0b' : 'none'} strokeWidth={1.5} />
                  </button>
                ))}
              </div>

              <div className="feedback-form-group">
                <label className="input-label">Impact Journal / Comments</label>
                <textarea
                  className="input-field feedback-area"
                  placeholder="Share details about the food quality or pickup experience..."
                  rows={4}
                />
              </div>

              <Button fullWidth onClick={handleSubmit} disabled={rating === 0}>
                PUBLISH FEEDBACK
              </Button>
            </Card>
          )}

          <div className="feedback-info-cards">
            <Card className="info-mini-card hover-lift">
              <div className="info-mini-icon"><ThumbsUp size={24} /></div>
              <div>
                <h4>Trust Anchoring</h4>
                <p>High-quality reviews boost your matching priority with premium donors.</p>
              </div>
            </Card>
            <Card className="info-mini-card hover-lift">
              <div className="info-mini-icon"><MessageSquare size={24} /></div>
              <div>
                <h4>Direct Feedback</h4>
                <p>Your suggestions go directly to our logistics optimization engine.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
