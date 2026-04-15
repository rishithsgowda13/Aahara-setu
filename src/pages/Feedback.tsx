import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Star, MessageSquare, ThumbsUp, Award, Heart, BarChart3 } from 'lucide-react';
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
  const meals = 120;
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
        <h1 className="page-title">Feedback & <span className="gradient-text">Kindness Score</span></h1>
        <p className="page-subtitle">Rate your experience and track your community impact.</p>
      </div>

      <div className="feedback-layout">
        {/* Kindness Score Card */}
        <Card className="kindness-card">
          <div className="kindness-header">
            <Award size={24} />
            <h3>Your Kindness Score</h3>
          </div>

          <div className="kindness-score-circle">
            <div className="ks-number">{kindnessScore}</div>
            <div className="ks-label">points</div>
          </div>

          <div className="ks-milestone-badge" style={{ background: milestone.color + '22', color: milestone.color, border: `1px solid ${milestone.color}44` }}>
            {milestone.label}
          </div>

          <div className="ks-progress-wrap">
            <div className="ks-progress-label">
              <span>{milestone.label}</span>
              {nextMilestone && <span>{nextMilestone.label}</span>}
            </div>
            <div className="ks-progress-bar">
              <div className="ks-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            {nextMilestone && (
              <p className="ks-progress-hint">{nextMilestone.threshold - kindnessScore} points to {nextMilestone.label}</p>
            )}
          </div>

          <div className="ks-impact-msg">
            <Heart size={18} />
            <span>You helped feed <strong>{meals} people</strong> ❤️</span>
          </div>

          <div className="ks-stats-row">
            <div className="ks-stat">
              <BarChart3 size={16} />
              <div>
                <div className="ks-stat-val">8</div>
                <div className="ks-stat-lbl">Donations Made</div>
              </div>
            </div>
            <div className="ks-stat">
              <ThumbsUp size={16} />
              <div>
                <div className="ks-stat-val">4.8 ⭐</div>
                <div className="ks-stat-lbl">Avg. Rating</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Rating Form */}
        <div className="feedback-form-section">
          {submitted ? (
            <Card className="thank-you-card">
              <div className="ty-icon">🙏</div>
              <h3>Thank you for your feedback!</h3>
              <p>Your review helps improve the CFRN network and builds trust in the community.</p>
              <div className="ty-score-gain">
                <Award size={16} />
                <span>+5 Kindness Points earned!</span>
              </div>
              <Button variant="outline" onClick={() => { setSubmitted(false); setRating(0); }}>Submit Another</Button>
            </Card>
          ) : (
            <Card className="rating-card">
              <h3>Rate Your Experience</h3>
              <p className="card-desc">How was the food quality and pickup process?</p>

              <div className="category-row">
                {['Food Quality', 'Pickup Speed', 'Donor Responsiveness', 'Packaging'].map(cat => (
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
                    <Star size={36} fill={star <= (hover || rating) ? '#f59e0b' : 'none'} strokeWidth={1.5} />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="rating-label">
                  {['', 'Poor 😞', 'Fair 😐', 'Good 🙂', 'Great 😄', 'Excellent 🤩'][rating]}
                </p>
              )}

              <div className="feedback-form-group">
                <label className="input-label">Describe your experience</label>
                <textarea
                  className="input-field feedback-area"
                  placeholder="Was the food fresh? Was the donor responsive? Any improvements?"
                  rows={4}
                />
              </div>

              <Button fullWidth onClick={handleSubmit} disabled={rating === 0}>
                Submit Review
              </Button>
              {rating === 0 && <p className="rating-hint">Please select a star rating to submit.</p>}
            </Card>
          )}

          <div className="feedback-info-cards">
            <Card className="info-mini-card">
              <div className="info-mini-icon"><ThumbsUp size={20} /></div>
              <div>
                <h4>Community Trust</h4>
                <p>Ratings help reputable donors and NGOs connect faster and build verified profiles.</p>
              </div>
            </Card>
            <Card className="info-mini-card">
              <div className="info-mini-icon"><MessageSquare size={20} /></div>
              <div>
                <h4>Direct Impact</h4>
                <p>Your suggestions go directly to helping us optimize routes, reduce wait times, and improve food safety.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
