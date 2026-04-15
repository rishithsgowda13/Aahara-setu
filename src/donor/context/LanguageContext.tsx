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
    nav_donate: 'Donate',
    nav_disasters: 'Disasters',
    nav_alerts: 'Alerts',
    nav_profile: 'Profile',
    // Landing
    hero_title: 'Reduce Waste. Feed Lives.',
    hero_subtitle: 'A real-time, location-based platform connecting restaurants & hotels with NGOs — powered by smart urgency matching.',
    donate_btn: 'Donate',
    // Dashboard
    impact_dash: 'Impact Dashboard',
    food_saved: 'Food Saved',
    meals_dist: 'Meals Distributed',
    co2_reduced: 'CO₂ Reduced',
    impact_summary: 'Impact Summary',
    meals_provided: 'Meals Provided',
    kindness_pts: 'Kindness Pts',
    recent_activity: 'Recent Activity',
    // Upload Page
    upload_title: 'Initiate Food Rescue',
    upload_sub: 'List your surplus in under 60 seconds.',
    item_info: 'Item Information',
    item_name_label: 'What are you rescued today?',
    food_cat: 'Food Category',
    qty_assess: 'Quantity Assessment',
    calc_expiry: 'Calculated Expiry',
    diet_class: 'Dietary Classification',
    pickup_addr: 'Precise Pickup Address',
    detect_loc: 'Auto-detect Location',
    qa_audit: 'Quality Assurance Audit',
    publish_btn: 'PUBLISH RESCUE LISTING',
    social_impact: 'PREDICTED SOCIAL IMPACT',
    people_fed: 'PEOPLE FED',
    carbon_offset: 'CARBON OFFSET',
    network_xp: 'NETWORK XP',
    // Explore / Receiver
    explore_title: 'Find Food Nearby',
    explore_sub: 'Real-time surplus food available, sorted by urgency.',
    search_placeholder: 'Search food name or category...',
    urgency_high: 'High Priority',
    urgency_med: 'Medium Priority',
    urgency_low: 'Low Priority',
    claim_now: 'Claim Now',
    ai_match_title: 'Aahara AI Match',
    // Profile
    org_details: 'Organization Details',
    edit_profile: 'Edit Profile',
    fssai_license: 'FSSAI License',
    achievements: 'Achievements',
    rookie: 'ROOKIE',
    trusted: 'TRUSTED',
    champion: 'CHAMPION',
    sign_out: 'SIGN OUT',
    settings_lang_title: 'Language Preferences',
    // Common
    org_type: 'Organization Type',
    contact: 'Contact',
    location: 'Location',
  },
  HI: {
    nav_home: 'मुख्य पृष्ठ',
    nav_dashboard: 'डैशबोर्ड',
    nav_kindness: 'दया केंद्र',
    nav_traceability: 'ट्रैसेबिलिटी',
    nav_donate: 'दान करें',
    nav_disasters: 'आपदा राहत',
    nav_alerts: 'सूचनाएं',
    nav_profile: 'प्रोफ़ाइल',
    hero_title: 'बर्बादी कम करें। जीवन बचाएं।',
    hero_subtitle: 'रेस्तरां और होटलों को एनजीओ से जोड़ने वाला एक वास्तविक समय, स्थान-आधारित मंच।',
    donate_btn: 'दान करें',
    impact_dash: 'प्रभाव डैशबोर्ड',
    food_saved: 'बचाया गया भोजन',
    meals_dist: 'वितरित भोजन',
    co2_reduced: 'CO₂ की कमी',
    impact_summary: 'प्रभाव का सार',
    meals_provided: 'प्रदान किया गया भोजन',
    kindness_pts: 'दया अंक',
    recent_activity: 'हाल की गतिविधि',
    upload_title: 'भोजन बचाव शुरू करें',
    upload_sub: 'अपनी अतिरिक्त सामग्री को 60 सेकंड से कम समय में सूचीबद्ध करें।',
    item_info: 'सामग्री की जानकारी',
    item_name_label: 'आज आप क्या बचा रहे हैं?',
    food_cat: 'भोजन की श्रेणी',
    qty_assess: 'मात्रा का आकलन',
    calc_expiry: 'समाप्ति का समय',
    diet_class: 'ाहार वर्गीकरण',
    pickup_addr: 'पिकअप का पता',
    detect_loc: 'स्थान का पता लगाएं',
    qa_audit: 'गुणवत्ता आश्वासन ऑडिट',
    publish_btn: 'बचाव सूची प्रकाशित करें',
    social_impact: 'अनुमानित सामाजिक प्रभाव',
    people_fed: 'भोजन प्राप्त लोग',
    carbon_offset: 'कार्बन ऑफसेट',
    network_xp: 'नेटवर्क XP',
    explore_title: 'पास का भोजन खोजें',
    explore_sub: 'उपलब्ध भोजन, तात्कालिकता के अनुसार क्रमबद्ध।',
    search_placeholder: 'भोजन या श्रेणी खोजें...',
    urgency_high: 'उच्च प्राथमिकता',
    urgency_med: 'सामान्य प्राथमिकता',
    urgency_low: 'कम प्राथमिकता',
    claim_now: 'अभी दावा करें',
    ai_match_title: 'आहारा AI मिलान',
    org_details: 'संस्था का विवरण',
    edit_profile: 'प्रोफ़ाइल संपादित करें',
    fssai_license: 'FSSAI लाइसेंस',
    achievements: 'उपलब्धियां',
    rookie: 'नौसिखिया',
    trusted: 'विश्वसनीय',
    champion: 'चैंपियन',
    sign_out: 'साइन आउट',
    settings_lang_title: 'भाषा प्राथमिकताएं',
    org_type: 'संस्था का प्रकार',
    contact: 'संपर्क',
    location: 'स्थान',
  },
  KA: {
    nav_home: 'ಮುಖಪುಟ',
    nav_dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    nav_kindness: 'ದಯಾ ಕೇಂದ್ರ',
    nav_traceability: 'ಟ್ರೇಸಿಬಿಲಿಟಿ',
    nav_donate: 'ದಾನ ಮಾಡಿ',
    nav_disasters: 'ವಿಪತ್ತು ಪರಿಹಾರ',
    nav_alerts: 'ಎಚ್ಚರಿಕೆಗಳು',
    nav_profile: 'ಪ್ರೊಫೈಲ್',
    hero_title: 'ಪೋಲು ಕಡಿಮೆ ಮಾಡಿ. ಜೀವಗಳನ್ನು ಉಳಿಸಿ.',
    hero_subtitle: 'ಹೋಟೆಲ್‌ಗಳನ್ನು ಎನ್‌ಜಿಒಗಳೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವ ಒಂದು ನೈಜ-ಸಮಯದ ವೇದಿಕೆ.',
    donate_btn: 'ದಾನ ಮಾಡಿ',
    impact_dash: 'ಪ್ರಭಾವದ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    food_saved: 'ಉಳಿಸಿದ ಆಹಾರ',
    meals_dist: 'ವಿತರಿಸಿದ ಊಟಗಳು',
    co2_reduced: 'CO₂ ಕಡಿತ',
    impact_summary: 'ಪ್ರಭಾವದ ಸಾರಾಂಶ',
    meals_provided: 'ಒದಗಿಸಿದ ಊಟಗಳು',
    kindness_pts: 'ದಯಾ ಅಂಕಗಳು',
    recent_activity: 'ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ',
    upload_title: 'ಆಹಾರ ರಕ್ಷಣೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ',
    upload_sub: '60 ಸೆಕೆಂಡ್‌ಗಳಲ್ಲಿ ನಿಮ್ಮ ಹೆಚ್ಚುವರಿ ಆಹಾರವನ್ನು ಪಟ್ಟಿ ಮಾಡಿ.',
    item_info: 'ವಸ್ತುವಿನ ಮಾಹಿತಿ',
    item_name_label: 'ಇಂದು ನೀವು ಏನನ್ನು ಉಳಿಸುತ್ತಿದ್ದೀರಿ?',
    food_cat: 'ಆಹಾರದ ವರ್ಗ',
    qty_assess: 'ಪ್ರಮಾಣದ ಮೌಲ್ಯಮಾಪನ',
    calc_expiry: 'ಮುಕ್ತಾಯದ ಅವಧಿ',
    diet_class: 'ಆಹಾರದ ವರ್ಗೀಕರಣ',
    pickup_addr: 'ಪಿಕಪ್ ವಿಳಾಸ',
    detect_loc: 'ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಿ',
    qa_audit: 'ಗುಣಮಟ್ಟದ ತಪಾಸಣೆ',
    publish_btn: 'ಪಟ್ಟಿಯನ್ನು ಪ್ರಕಟಿಸಿ',
    social_impact: 'ಸಾಮಾಜಿಕ ಪ್ರಭಾವ',
    people_fed: 'ಊಟ ನೀಡಿದ ಜನರು',
    carbon_offset: 'ಕಾರ್ಬನ್ ಆಫ್‌ಸೆಟ್',
    network_xp: 'ನೆಟ್‌ವರ್ಕ್ XP',
    explore_title: 'ಹತ್ತಿರದ ಆಹಾರ ಹುಡುಕಿ',
    explore_sub: 'ಲಭ್ಯವಿರುವ ಆಹಾರ, ತುರ್ತುಸ್ಥಿತಿಗೆ ಅನುಗುಣವಾಗಿ ವಿಂಗಡಿಸಲಾಗಿದೆ.',
    search_placeholder: 'ಆಹಾರ ಅಥವಾ ವರ್ಗ ಹುಡುಕಿ...',
    urgency_high: 'ಹೆಚ್ಚಿನ ಆದ್ಯತೆ',
    urgency_med: 'ಮಧ್ಯಮ ಆದ್ಯತೆ',
    urgency_low: 'ಕಡಿಮೆ ಆದ್ಯತೆ',
    claim_now: 'ಈಗಲೇ ಪಡೆಯಿರಿ',
    ai_match_title: 'ಆಹಾರ AI ಮ್ಯಾಚ್',
    org_details: 'ಸಂಸ್ಥೆಯ ವಿವರಗಳು',
    edit_profile: 'ಪ್ರೊಫೈಲ್ ತಿದ್ದಿ',
    fssai_license: 'FSSAI ಪರವಾನಗಿ',
    achievements: 'ಸಾಧನೆಗಳು',
    rookie: 'ರೂಕಿ',
    trusted: 'ವಿಶ್ವಾಸಾರ್ಹ',
    champion: 'ಚಾಂಪಿಯನ್',
    recent_activity: 'ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ',
    sign_out: 'ಸೈನ್ ಔಟ್',
    settings_lang_title: 'ಭಾಷಾ ಆದ್ಯತೆಗಳು',
    org_type: 'ಸಂಸ್ಥೆಯ ವಿಧ',
    contact: 'ಸಂಪರ್ಕಿಸಿ',
    location: 'ಸ್ಥಳ',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('EN');

  const t = (key: string) => {
    return translations[lang]?.[key] || translations['EN']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a dummy context to prevent crashes if used outside provider
    return {
      lang: 'EN' as const,
      setLang: () => {},
      t: (key: string) => key
    };
  }
  return context;
};
