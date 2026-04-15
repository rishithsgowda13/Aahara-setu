import React, { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'EN' | 'HI' | 'KA';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  EN: {
    // Navbar
    nav_home: 'Home',
    nav_dashboard: 'Dashboard',
    nav_kindness: 'Kindness Hub',
    nav_traceability: 'Traceability',
    nav_donate: 'Donate Food',
    nav_disasters: 'Disasters',
    nav_alerts: 'Alerts',
    nav_profile: 'Profile',
    // Landing
    hero_title: 'Reduce Waste. Feed Lives.',
    hero_subtitle: 'A real-time, location-based platform connecting restaurants & hotels with NGOs — powered by smart urgency matching.',
    donate_btn: 'Donate Food',
    find_food: 'Find Food Nearby',
    // Dashboard
    impact_dash: 'Impact Dashboard',
    food_saved: 'Food Saved',
    meals_dist: 'Meals Distributed',
    co2_reduced: 'CO₂ Reduced',
    // Profile
    org_details: 'Organization Details',
    edit_profile: 'Edit Profile',
    fssai_license: 'FSSAI License',
    // Kindness Hub
    global_leaderboard: 'Global Leaderboard',
    impact_certs: 'Impact Certificates',
    kindness_hub_title: 'Community Kindness Hub',
  },
  HI: {
    nav_home: 'मुख्य पृष्ठ',
    nav_dashboard: 'डैशबोर्ड',
    nav_kindness: 'दया केंद्र',
    nav_traceability: 'ट्रैसेबिलिटी',
    nav_donate: 'भोजन दान करें',
    nav_disasters: 'आपदा राहत',
    nav_alerts: 'सूचनाएं',
    nav_profile: 'प्रोफ़ाइल',
    hero_title: 'बर्बादी कम करें। जीवन बचाएं।',
    hero_subtitle: 'रेस्तरां और होटलों को एनजीओ से जोड़ने वाला एक वास्तविक समय, स्थान-आधारित मंच।',
    donate_btn: 'भोजन दान करें',
    find_food: 'पास का भोजन खोजें',
    impact_dash: 'प्रभाव डैशबोर्ड',
    food_saved: 'बचाया गया भोजन',
    meals_dist: 'वितरित भोजन',
    co2_reduced: 'CO₂ की कमी',
    org_details: 'संस्था का विवरण',
    edit_profile: 'प्रोफ़ाइल संपादित करें',
    fssai_license: 'FSSAI लाइसेंस',
    global_leaderboard: 'वैश्विक लीडरबोर्ड',
    impact_certs: 'प्रभाव प्रमाणपत्र',
    kindness_hub_title: 'सामुदायिक दया केंद्र',
  },
  KA: {
    nav_home: 'ಮುಖಪುಟ',
    nav_dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    nav_kindness: 'ದಯಾ ಕೇಂದ್ರ',
    nav_traceability: 'ಟ್ರೇಸಿಬಿಲಿಟಿ',
    nav_donate: 'ಆಹಾರ ದಾನ ಮಾಡಿ',
    nav_disasters: 'ವಿಪತ್ತು ಪರಿಹಾರ',
    nav_alerts: 'ಎಚ್ಚರಿಕೆಗಳು',
    nav_profile: 'ಪ್ರೊಫೈಲ್',
    hero_title: 'ಪೋಲು ಕಡಿಮೆ ಮಾಡಿ. ಜೀವಗಳನ್ನು ಉಳಿಸಿ.',
    hero_subtitle: 'ಹೋಟೆಲ್‌ಗಳನ್ನು ಎನ್‌ಜಿಒಗಳೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವ ಒಂದು ನೈಜ-ಸಮಯದ ವೇದಿಕೆ.',
    donate_btn: 'ಆಹಾರ ದಾನ ಮಾಡಿ',
    find_food: 'ಹತ್ತಿರದ ಆಹಾರ ಹುಡುಕಿ',
    impact_dash: 'ಪ್ರಭಾವದ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    food_saved: 'ಉಳಿಸಿದ ಆಹಾರ',
    meals_dist: 'ವಿತರಿಸಿದ ಊಟಗಳು',
    co2_reduced: 'CO₂ ಕಡಿತ',
    org_details: 'ಸಂಸ್ಥೆಯ ವಿವರಗಳು',
    edit_profile: 'ಪ್ರೊಫೈಲ್ ತಿದ್ದಿ',
    fssai_license: 'FSSAI ಪರವಾನಗಿ',
    global_leaderboard: 'ಜಾಗತಿಕ ಲೀಡರ್‌ಬೋರ್ಡ್',
    impact_certs: 'ಪ್ರಭಾವ ಪ್ರಮಾಣಪತ್ರಗಳು',
    kindness_hub_title: 'ಸಮುದಾಯ ದಯಾ ಕೇಂದ್ರ',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('EN');

  const t = (key: string) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within LanguageProvider');
  return context;
};
