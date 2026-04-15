export const MEAL_PAIRS: Record<string, string[]> = {
  'Rice': ['Sambar', 'Rasam', 'Curd', 'Dal', 'Kadhi'],
  'Chapati': ['Sabji', 'Gravy', 'Paneer', 'Curry'],
  'Roti': ['Sabji', 'Gravy', 'Paneer', 'Curry'],
  'Bread': ['Butter', 'Jam', 'Omelette'],
  'Idli': ['Sambar', 'Chutney'],
  'Dosa': ['Sambar', 'Chutney', 'Aloo Masala'],
};

export const findMatch = (itemName: string, availableItems: string[]) => {
  const normalizedName = itemName.toLowerCase();
  
  for (const [core, complements] of Object.entries(MEAL_PAIRS)) {
    if (normalizedName.includes(core.toLowerCase())) {
      // Find if any complement is in the available list
      const match = availableItems.find(avail => 
        complements.some(comp => avail.toLowerCase().includes(comp.toLowerCase()))
      );
      return match ? { core, match } : null;
    }
  }
  
  // Also check reverse: if this is a complement, find its core
  for (const [core, complements] of Object.entries(MEAL_PAIRS)) {
    if (complements.some(comp => normalizedName.includes(comp.toLowerCase()))) {
      const match = availableItems.find(avail => avail.toLowerCase().includes(core.toLowerCase()));
      return match ? { complement: itemName, core: match } : null;
    }
  }

  return null;
};
