export const MEAL_PAIRS: Record<string, string[]> = {
  'Rice': ['Sambar', 'Rasam', 'Curd', 'Dal', 'Kadhi', 'Veg Curry'],
  'Chapati': ['Sabji', 'Gravy', 'Paneer', 'Curry', 'Daal'],
  'Roti': ['Sabji', 'Gravy', 'Paneer', 'Curry', 'Daal'],
  'Bread': ['Butter', 'Jam', 'Omelette', 'Sandwich Spread', 'Milk'],
  'Idli': ['Sambar', 'Chutney', 'Vada'],
  'Dosa': ['Sambar', 'Chutney', 'Aloo Masala'],
  'Puri': ['Aloo Bhaji', 'Chana Masala', 'Shrikhand'],
  'Vada': ['Sambar', 'Chutney'],
  'Milk': ['Biscuits', 'Bread', 'Cereal', 'Fruit'],
  'Burger': ['Fries', 'Coke', 'Ketchup'],
  'Pasta': ['Garlic Bread', 'Red Sauce', 'White Sauce'],
  'Biryani': ['Raitha', 'Salan', 'Curd'],
};

export interface MatchResult {
  type: 'complement' | 'core' | 'direct';
  itemName: string;
  matchedWith: string;
  score: number;
}

export const findMatch = (itemName: string, availableItems: { name: string, id: string }[]): MatchResult | null => {
  const normalizedInput = itemName.toLowerCase().trim();
  
  for (const available of availableItems) {
    const normalizedAvail = available.name.toLowerCase().trim();
    
    // 1. Direct Match
    if (normalizedInput === normalizedAvail || normalizedInput.includes(normalizedAvail) || normalizedAvail.includes(normalizedInput)) {
      return { type: 'direct', itemName: available.name, matchedWith: itemName, score: 100 };
    }

    // 2. Core to Complement Match
    for (const [core, complements] of Object.entries(MEAL_PAIRS)) {
      const coreLower = core.toLowerCase();
      
      // If user wants CORE, is COMPLEMENT available?
      if (normalizedInput.includes(coreLower)) {
        const matchingComp = complements.find(comp => normalizedAvail.includes(comp.toLowerCase()));
        if (matchingComp) {
          return { type: 'complement', itemName: available.name, matchedWith: itemName, score: 85 };
        }
      }

      // If user wants COMPLEMENT, is CORE available?
      const isInputComplement = complements.some(comp => normalizedInput.includes(comp.toLowerCase()));
      if (isInputComplement && normalizedAvail.includes(coreLower)) {
        return { type: 'core', itemName: available.name, matchedWith: itemName, score: 90 };
      }
    }
  }
  
  return null;
};

