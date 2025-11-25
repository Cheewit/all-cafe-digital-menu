// © 2025 Cheewit Manketwit. All rights reserved.
// BaristA:i_V4.3_AI_KNOWLEDGE_SIG (Expert Beverage Edition)
// ออกแบบตามหมวด: Coffee, Tea, Milk, Fruit, Chocolate, Thai Favorites, Pang Yen
// หมายเหตุ: ชื่อ key ต้องตรงกับชื่อเมนูที่มาจากชีต

export interface MenuKnowledge {
  mainFlavor: string;
  profile: string[]; 
  base: 'coffee' | 'tea' | 'milk' | 'fruit_juice' | 'soda' | 'chocolate' | 'dessert';
}

/**
 * NOTE on profiles:
 * - temp: 'hot' | 'cold' | 'frozen'
 * - body/texture: 'creamy' | 'light' | 'foamy' | 'indulgent'
 * - function: 'caffeinated' | 'kids-friendly' | 'dessert-drink' | 'thirst-quencher'
 * - context: 'morning' | 'afternoon' | 'evening' | 'summer' | 'large-size'
 * - culture: 'thai-palate' | 'allcafe-signature'
 */

export const MENU_KNOWLEDGE_BASE: Record<string, MenuKnowledge> = {
  // =============== COFFEE =================
  'กาแฟร้อน Signature': {
    mainFlavor: 'espresso',
    profile: [
      'hot','caffeinated','rich','aromatic',
      'morning'
    ],
    base: 'coffee',
  },
  'เอสเพรสโซ่ร้อน': {
    mainFlavor: 'espresso',
    profile: ['hot','caffeinated','strong','short-drink','morning'],
    base: 'coffee',
  },
  'เอสเพรสโซ่เย็น': {
    mainFlavor: 'espresso',
    profile: ['cold','caffeinated','strong','refreshing','afternoon'],
    base: 'coffee',
  },
  'เอสเพรสโซ่เย็น22ออนซ์': {
    mainFlavor: 'espresso',
    profile: ['cold','caffeinated','strong','refreshing','large-size','takeout'],
    base: 'coffee',
  },
  'เอสเพรสโซ่ปั่น': {
    mainFlavor: 'espresso',
    profile: ['frozen','caffeinated','creamy','dessert-drink','indulgent'],
    base: 'coffee',
  },
  'เอสเพรสโซ่ปั่น22ออนซ์': {
    mainFlavor: 'espresso',
    profile: ['frozen','caffeinated','creamy','dessert-drink','indulgent','large-size'],
    base: 'coffee',
  },
  'เอสเพรสโซ่signature': {
    mainFlavor: 'espresso',
    profile: ['caffeinated','rich','premium','allcafe-signature'],
    base: 'coffee',
  },

  'อเมริกาโน่ร้อน': {
    mainFlavor: 'espresso',
    profile: ['hot','caffeinated','light-body','no-milk','low-cal','morning'],
    base: 'coffee',
  },
  'อเมริกาโน่เย็น': {
    mainFlavor: 'espresso',
    profile: ['cold','caffeinated','light-body','thirst-quencher','summer'],
    base: 'coffee',
  },
  'อเมริกาโน่เย็น22ออนซ์': {
    mainFlavor: 'espresso',
    profile: ['cold','caffeinated','light-body','thirst-quencher','summer','large-size'],
    base: 'coffee',
  },

  // honey americano
  'อเมริกาโน่น้ำผึ้งเย็น': {
    mainFlavor: 'honey',
    profile: ['cold','caffeinated','light-sweet','refreshing','no-milk'],
    base: 'coffee',
  },
  'อเมริกาโน่น้ำผึ้งเย็น 22 ออนซ์': {
    mainFlavor: 'honey',
    profile: ['cold','caffeinated','light-sweet','refreshing','no-milk','large-size'],
    base: 'coffee',
  },
  'อเมริกาโน่น้ำผึ้งร้อน': {
    mainFlavor: 'honey',
    profile: ['hot','caffeinated','light-sweet','comfort'],
    base: 'coffee',
  },

  // orange americano
  'อเมริกาโน่น้ำส้ม': {
    mainFlavor: 'orange',
    profile: ['cold','caffeinated','citrus','refreshing','summer','trend'],
    base: 'coffee',
  },

  // latte
  'ลาเต้ร้อน': {
    mainFlavor: 'espresso',
    profile: ['hot','caffeinated','milky','smooth','comfort','morning'],
    base: 'coffee',
  },
  'ลาเต้เย็น': {
    mainFlavor: 'espresso',
    profile: ['cold','caffeinated','milky','smooth','refreshing'],
    base: 'coffee',
  },
  'ลาเต้เย็น22ออนซ์': {
    mainFlavor: 'espresso',
    profile: ['cold','caffeinated','milky','smooth','refreshing','large-size'],
    base: 'coffee',
  },
  'ลาเต้ปั่น': {
    mainFlavor: 'espresso',
    profile: ['frozen','caffeinated','creamy','dessert-drink','sweet'],
    base: 'coffee',
  },
  'ลาเต้ปั่น22ออนซ์': {
    mainFlavor: 'espresso',
    profile: ['frozen','caffeinated','creamy','dessert-drink','sweet','large-size'],
    base: 'coffee',
  },

  // cappuccino
  'คาปูชิโน่ร้อน': {
    mainFlavor: 'espresso',
    profile: ['hot','caffeinated','foamy','aromatic','morning'],
    base: 'coffee',
  },
  'คาปูชิโน่เย็น': {
    mainFlavor: 'espresso',
    profile: ['cold','caffeinated','milky','refreshing'],
    base: 'coffee',
  },
  'คาปูชิโน่เย็น22ออนซ์': {
    mainFlavor: 'espresso',
    profile: ['cold','caffeinated','milky','refreshing','large-size'],
    base: 'coffee',
  },
  'คาปูชิโน่ปั่น': {
    mainFlavor: 'espresso',
    profile: ['frozen','caffeinated','creamy','dessert-drink'],
    base: 'coffee',
  },
  'คาปูชิโน่ปั่น22ออนซ์': {
    mainFlavor: 'espresso',
    profile: ['frozen','caffeinated','creamy','dessert-drink','large-size'],
    base: 'coffee',
  },

  // mocha
  'มอคค่าร้อน': {
    mainFlavor: 'chocolate',
    profile: ['hot','caffeinated','creamy','choco','comfort'],
    base: 'coffee',
  },
  'มอคค่าเย็น': {
    mainFlavor: 'chocolate',
    profile: ['cold','caffeinated','creamy','sweet'],
    base: 'coffee',
  },
  'มอคค่าเย็น22ออนซ์': {
    mainFlavor: 'chocolate',
    profile: ['cold','caffeinated','creamy','sweet','large-size'],
    base: 'coffee',
  },
  'มอคค่าปั่น': {
    mainFlavor: 'chocolate',
    profile: ['frozen','caffeinated','creamy','dessert-drink','indulgent'],
    base: 'coffee',
  },
  'มอคค่าปั่น22ออนซ์': {
    mainFlavor: 'chocolate',
    profile: ['frozen','caffeinated','creamy','dessert-drink','indulgent','large-size'],
    base: 'coffee',
  },

  // macchiato
  'มัคคิอาโต้เย็น': {
    mainFlavor: 'espresso',
    profile: ['cold','caffeinated','layered','milky','sweet'],
    base: 'coffee',
  },
  'มัคคิอาโตเย็น22ออนซ์': {
    mainFlavor: 'espresso',
    profile: ['cold','caffeinated','layered','milky','sweet','large-size'],
    base: 'coffee',
  },

  // =============== CHOCOLATE =================
  'ช็อกโกแลตร้อน': {
    mainFlavor: 'chocolate',
    profile: ['hot','creamy','sweet','comfort','kids-friendly','evening'],
    base: 'chocolate',
  },
  'ช็อกโกแลตเย็น': {
    mainFlavor: 'chocolate',
    profile: ['cold','creamy','sweet','kids-friendly'],
    base: 'chocolate',
  },
  'ช็อกโกแลตเย็น22ออนซ์': {
    mainFlavor: 'chocolate',
    profile: ['cold','creamy','sweet','kids-friendly','large-size'],
    base: 'chocolate',
  },
  'ช็อกโกแลตปั่น': {
    mainFlavor: 'chocolate',
    profile: ['frozen','creamy','sweet','dessert-drink'],
    base: 'chocolate',
  },
  'ช็อกโกแลตปั่น22ออนซ์': {
    mainFlavor: 'chocolate',
    profile: ['frozen','creamy','sweet','dessert-drink','large-size'],
    base: 'chocolate',
  },
  'ช็อกโกแลตsignature': {
    mainFlavor: 'chocolate',
    profile: ['cold','creamy','sweet','premium','allcafe-signature'],
    base: 'chocolate',
  },

  // =============== TEA (Matcha / Black / Lemon) =================
  'ชาเขียวนมมัทฉะร้อน': {
    mainFlavor: 'matcha',
    profile: ['hot','tea-based','creamy','earthy','comfort'],
    base: 'tea',
  },
  'ชาเขียวนมมัทฉะเย็น': {
    mainFlavor: 'matcha',
    profile: ['cold','tea-based','creamy','sweet','refreshing'],
    base: 'tea',
  },
  'ชาเขียวนมมัทฉะเย็น22ออนซ์': {
    mainFlavor: 'matcha',
    profile: ['cold','tea-based','creamy','sweet','refreshing','large-size'],
    base: 'tea',
  },
  'ชาเขียวนมมัทฉะปั่น': {
    mainFlavor: 'matcha',
    profile: ['frozen','tea-based','creamy','dessert-drink','sweet'],
    base: 'tea',
  },
  'ชาเขียวนมมัทฉะปั่น22ออนซ์': {
    mainFlavor: 'matcha',
    profile: ['frozen','tea-based','creamy','dessert-drink','sweet','large-size'],
    base: 'tea',
  },

  'เพียวมัทฉะเย็น': {
    mainFlavor: 'matcha',
    profile: ['cold','tea-based','less-milky','japanese-style','refreshing'],
    base: 'tea',
  },

  'ชาดำน้ำผึ้งเย็น': {
    mainFlavor: 'honey',
    profile: ['cold','refreshing','light-sweet','tea-based','thirst-quencher'],
    base: 'tea',
  },
  'ชาดำน้ำผึ้งเย็น22oz.': {
    mainFlavor: 'honey',
    profile: ['cold','refreshing','light-sweet','tea-based','thirst-quencher','large-size'],
    base: 'tea',
  },

  'ชามะนาวเย็น': {
    mainFlavor: 'lemon',
    profile: ['cold','refreshing','citrus','summer','thirst-quencher'],
    base: 'tea',
  },
  'ชามะนาวเย็น22ออนซ์': {
    mainFlavor: 'lemon',
    profile: ['cold','refreshing','citrus','summer','thirst-quencher','large-size'],
    base: 'tea',
  },

  // =============== THAI FAVORITES ===============
  // กลุ่มนี้คือรสชาติแบบไทยๆ, sala ให้แท็กว่า fragrant + thai-palate

  'ชานมเย็น': {
    mainFlavor: 'thai tea',
    profile: ['cold','creamy','sweet','bold','thai-palate','refreshing'],
    base: 'tea',
  },
  'ชานมเย็น22ออนซ์': {
    mainFlavor: 'thai tea',
    profile: ['cold','creamy','sweet','bold','thai-palate','refreshing','large-size'],
    base: 'tea',
  },
  'ชานมปั่น': {
    mainFlavor: 'thai tea',
    profile: ['frozen','creamy','sweet','thai-palate','dessert-drink'],
    base: 'tea',
  },
  'ชานมปั่น22ออนซ์': {
    mainFlavor: 'thai tea',
    profile: ['frozen','creamy','sweet','thai-palate','dessert-drink','large-size'],
    base: 'tea',
  },

  'ชานมร้อน': {
    mainFlavor: 'thai tea',
    profile: ['hot','creamy','sweet','thai-palate','comfort'],
    base: 'tea',
  },

  'ชานมไต้หวันเย็น': {
    mainFlavor: 'black tea',
    profile: ['cold','creamy','sweet','trend','refreshing'],
    base: 'tea',
  },
  'ชานมไต้หวันเย็น22ออนซ์': {
    mainFlavor: 'black tea',
    profile: ['cold','creamy','sweet','trend','refreshing','large-size'],
    base: 'tea',
  },

  'นมชมพูเย็น': {
    mainFlavor: 'sala',
    profile: ['cold','creamy','sweet','fragrant','thai-palate','kids-friendly'],
    base: 'milk',
  },
  'นมชมพูเย็น 22 ออนซ์': {
    mainFlavor: 'sala',
    profile: ['cold','creamy','sweet','fragrant','thai-palate','kids-friendly','large-size'],
    base: 'milk',
  },
  'นมชมพูปั่น': {
    mainFlavor: 'sala',
    profile: ['frozen','creamy','sweet','fragrant','thai-palate','dessert-drink'],
    base: 'milk',
  },
  'นมชมพูปั่น 22 ออนซ์': {
    mainFlavor: 'sala',
    profile: ['frozen','creamy','sweet','fragrant','thai-palate','dessert-drink','large-size'],
    base: 'milk',
  },

  'แดงมะนาวโซดาเย็น': {
    mainFlavor: 'sala-lime',
    profile: ['cold','refreshing','bubbly','citrus','fragrant','thai-palate','summer'],
    base: 'soda',
  },
  'แดงมะนาวโซดาเย็น 22 ออนซ์-G': {
    mainFlavor: 'sala-lime',
    profile: ['cold','refreshing','bubbly','citrus','fragrant','thai-palate','summer','large-size'],
    base: 'soda',
  },

  // =============== MILK =================
  'นมสดร้อน': {
    mainFlavor: 'milk',
    profile: ['hot','creamy','comfort','kids-friendly','evening'],
    base: 'milk',
  },
  'นมสดเย็น': {
    mainFlavor: 'milk',
    profile: ['cold','creamy','light-sweet','refreshing'],
    base: 'milk',
  },
  'นมสดเย็น 22 ออนซ์': {
    mainFlavor: 'milk',
    profile: ['cold','creamy','light-sweet','refreshing','large-size'],
    base: 'milk',
  },
  'นมสดปั่น': {
    mainFlavor: 'milk',
    profile: ['frozen','creamy','sweet','dessert-drink'],
    base: 'milk',
  },
  'นมสดปั่น 22 ออนซ์': {
    mainFlavor: 'milk',
    profile: ['frozen','creamy','sweet','dessert-drink','large-size'],
    base: 'milk',
  },
  'นมสดน้ำผึ้งเย็น': {
    mainFlavor: 'honey',
    profile: ['cold','creamy','sweet','refreshing'],
    base: 'milk',
  },

  // coconut milk smoothie
  'มะพร้าวนมสดปั่น': {
    mainFlavor: 'coconut',
    profile: ['frozen','creamy','tropical','dessert-drink','refreshing'],
    base: 'milk',
  },

  // =============== FRUIT =================
  'น้ำส้มเย็น': {
    mainFlavor: 'orange',
    profile: ['cold','refreshing','fruit','thirst-quencher','kids-friendly'],
    base: 'fruit_juice',
  },
  'น้ำส้มเสาวรสเย็น': {
    mainFlavor: 'orange-passionfruit',
    profile: ['cold','refreshing','tropical','slightly-sour','summer'],
    base: 'fruit_juice',
  },

  // berry smoothies
  'เวรีมิกซ์เบอร์รีปั่น': {
    mainFlavor: 'mixed-berry',
    profile: ['frozen','fruity','refreshing','sour-sweet'],
    base: 'fruit_juice',
  },
  'เวรีมิกซ์เบอร์รีโยเกิร์ตปั่น': {
    mainFlavor: 'mixed-berry-yogurt',
    profile: ['frozen','fruity','refreshing','sour-sweet','creamy'],
    base: 'fruit_juice',
  },
  'เวรีสตรอว์เบอร์รีปั่น': {
    mainFlavor: 'strawberry',
    profile: ['frozen','fruity','sweet','refreshing'],
    base: 'fruit_juice',
  },
  'เวรีสตรอว์เบอร์รีโยเกิร์ตปั่น': {
    mainFlavor: 'strawberry-yogurt',
    profile: ['frozen','fruity','refreshing','creamy','sour-sweet'],
    base: 'fruit_juice',
  },

  // =============== PANG YEN (dessert drink with bread topping) =================
  'ปังเย็นเบิลช็อก': {
    mainFlavor: 'double-chocolate',
    profile: [
      'frozen','dessert','very-sweet','bread-topping',
      'indulgent','kids-friendly','heavy'
    ],
    base: 'dessert',
  },
  'ปังเย็นน้ำแดง': {
    mainFlavor: 'sala',
    profile: [
      'frozen','dessert','sweet','bread-topping',
      'fragrant','thai-palate','kids-friendly'
    ],
    base: 'dessert',
  },
  'ปังเย็นนมชมพู': {
    mainFlavor: 'sala-milk',
    profile: [
      'frozen','dessert','creamy','sweet','bread-topping',
      'fragrant','thai-palate'
    ],
    base: 'dessert',
  },
  'ปังนมสดภูเขาไฟ': {
    mainFlavor: 'milk',
    profile: [
      'frozen','dessert','creamy','bread-topping',
      'instagrammable','indulgent'
    ],
    base: 'dessert',
  },
  'ปังเย็นชาไทย': {
    mainFlavor: 'thai tea',
    profile: [
      'frozen','dessert','creamy','sweet','bread-topping',
      'thai-palate'
    ],
    base: 'dessert',
  },

  // =============== SPECIAL / MIX ===============
  'มัทฉะสตรอว์เบอร์รี': {
    mainFlavor: 'matcha-strawberry',
    profile: ['cold','tea-based','fruity','sweet','instagrammable','refreshing'],
    base: 'tea',
  },
};