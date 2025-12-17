// src/utils/provinceResolver.ts

/** Normalize: remove tones, spaces, dashes, dots, and convert to lowercase */
const normalize = (s: string) =>
  (s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.\s\-_/()]+/g, "")
    .toLowerCase();

/** A comprehensive list of official Thai province names. */
export const TH_PROVINCES: string[] = [
  "กรุงเทพมหานคร", "สมุทรปราการ", "นนทบุรี", "ปทุมธานี", "พระนครศรีอยุธยา", "อ่างทอง", "ลพบุรี",
  "สิงห์บุรี", "ชัยนาท", "สระบุรี", "ชลบุรี", "ระยอง", "จันทบุรี", "ตราด",
  "ฉะเชิงเทรา", "ปราจีนบุรี", "นครนายก", "สระแก้ว", "นครราชสีมา", "บุรีรัมย์",
  "สุรินทร์", "ศรีสะเกษ", "อุบลราชสีมา", "ยโสธร", "ชัยภูมิ", "อำนาจเจริญ",
  "บึงกาฬ", "มุกดาหาร", "หนองบัวลำภู", "ขอนแก่น", "อุดรธานี", "เลย", "หนองคาย",
  "มหาสารคาม", "ร้อยเอ็ด", "กาฬสินธุ์", "สกลนคร", "นครพนม", "เชียงใหม่",
  "ลำพูน", "ลำปาง", "อุตรดิตถ์", "แพร่", "น่าน", "พะเยา", "เชียงราย",
  "แม่ฮ่องสอน", "นครสวรรค์", "อุทัยธานี", "กำแพงเพชร", "ตาก", "สุโขทัย",
  "พิษณุโลก", "พิจิตร", "เพชรบูรณ์", "ราชบุรี", "กาญจนบุรี", "สุพรรณบุรี",
  "นครปฐม", "สมุทรสาคร", "สมุทรสงคราม", "เพชรบุรี", "ประจวบคีรีขันธ์",
  "นครศรีธรรมราช", "กระบี่", "พังงา", "ภูเก็ต", "สุราษฎร์ธานี", "ระนอง",
  "ชุมพร", "สงขลา", "สตูล", "ตรัง", "พัทลุง", "ปัตตานี", "ยะลา", "นราธิวาส",
];

/** Map from standard Thai province names to standard English names. */
export const TH_TO_EN: Record<string, string> = {
  "กรุงเทพมหานคร": "Bangkok", "สมุทรปราการ": "Samut Prakan", "นนทบุรี": "Nonthaburi", "ปทุมธานี": "Pathum Thani", "พระนครศรีอยุธยา": "Phra Nakhon Si Ayutthaya", "อ่างทอง": "Ang Thong", "ลพบุรี": "Lopburi", "สิงห์บุรี": "Sing Buri", "ชัยนาท": "Chai Nat", "สระบุรี": "Saraburi", "ชลบุรี": "Chon Buri", "ระยอง": "Rayong", "จันทบุรี": "Chanthaburi", "ตราด": "Trat", "ฉะเชิงเทรา": "Chachoengsao", "ปราจีนบุรี": "Prachinburi", "นครนายก": "Nakhon Nayok", "สระแก้ว": "Sa Kaeo", "นครราชสีมา": "Nakhon Ratchasima", "บุรีรัมย์": "Buri Ram", "สุรินทร์": "Surin", "ศรีสะเกษ": "Si Sa Ket", "อุบลราชสีมา": "Ubon Ratchathani", "ยโสธร": "Yasothon", "ชัยภูมิ": "Chaiyaphum", "อำนาจเจริญ": "Amnat Charoen", "บึงกาฬ": "Bueng Kan", "มุกดาหาร": "Mukdahan", "หนองบัวลำภู": "Nong Bua Lam Phu", "ขอนแก่น": "Khon Kaen", "อุดรธานี": "Udon Thani", "เลย": "Loei", "หนองคาย": "Nong Khai", "มหาสารคาม": "Maha Sarakham", "ร้อยเอ็ด": "Roi Et", "กาฬสินธุ์": "Kalasin", "สกลนคร": "Sakon Nakhon", "นครพนม": "Nakhon Phanom", "เชียงใหม่": "Chiang Mai", "ลำพูน": "Lamphun", "ลำปาง": "Lampang", "อุตรดิตถ์": "Uttaradit", "แพร่": "Phrae", "น่าน": "Nan", "พะเยา": "Phayao", "เชียงราย": "Chiang Rai", "แม่ฮ่องสอน": "Mae Hong Son", "นครสวรรค์": "Nakhon Sawan", "อุทัยธานี": "Uthai Thani", "กำแพงเพชร": "Kamphaengphet", "ตาก": "Tak", "สุโขทัย": "Sukhothai", "พิษณุโลก": "Phitsanulok", "พิจิตร": "Phichit", "เพชรบูรณ์": "Phetchabun", "ราชบุรี": "Ratchaburi", "กาญจนบุรี": "Kanchanaburi", "สุพรรณบุรี": "Suphan Buri", "นครปฐม": "Nakhon Pathom", "สมุทรสาคร": "Samut Sakhon", "สมุทรสงคราม": "Samut Songkhram", "เพชรบุรี": "Phetchaburi", "ประจวบคีรีขันธ์": "Prachuap Khiri Khan", "นครศรีธรรมราช": "Nakhon Si Thammarat", "กระบี่": "Krabi", "พังงา": "Phang Nga", "ภูเก็ต": "Phuket", "สุราษฎร์ธานี": "Surat Thani", "ระนอง": "Ranong", "ชุมพร": "Chumphon", "สงขลา": "Songkhla", "สตูล": "Satun", "ตรัง": "Trang", "พัทลุง": "Phatthalung", "ปัตตานี": "Pattani", "ยะลา": "Yala", "นราธิวาส": "Narathiwat",
};

/** A list of standard English province names. */
export const EN_PROVINCES: string[] = Object.values(TH_TO_EN);

/** Map from various English/Romanized aliases to standard English names. */
export const ALIAS_TO_EN: Record<string, string> = {
  bangkok: "Bangkok", krungthepmahanakhon: "Bangkok", bangkokmetropolis: "Bangkok", bkk: "Bangkok", krungthep: "Bangkok", krungthepmahanakhonrattanakosin: "Bangkok",
  samutprakan: "Samut Prakan",
  nonthaburi: "Nonthaburi", nontaburi: "Nonthaburi",
  pathumthani: "Pathum Thani",
  phranakhonsiayutthaya: "Phra Nakhon Si Ayutthaya", ayutthaya: "Phra Nakhon Si Ayutthaya",
  angthong: "Ang Thong",
  lopburi: "Lopburi",
  singburi: "Sing Buri",
  chainat: "Chai Nat",
  saraburi: "Saraburi",
  samutsakhon: "Samut Sakhon",
  samutsongkhram: "Samut Songkhram",
  nakhonpathom: "Nakhon Pathom",
  suphanburi: "Suphan Buri",
  phetchaburi: "Phetchaburi",
  prachuapkhirikhan: "Prachuap Khiri Khan",
  chachoengsao: "Chachoengsao",
  chonburi: "Chon Buri",
  rayong: "Rayong",
  chanthaburi: "Chanthaburi",
  trat: "Trat",
  prachinburi: "Prachinburi",
  nakhonnayok: "Nakhon Nayok",
  sakaeo: "Sa Kaeo",
  chiangmai: "Chiang Mai",
  lamphun: "Lamphun",
  lampang: "Lampang",
  uttaradit: "Uttaradit",
  phrae: "Phrae",
  nan: "Nan",
  phayao: "Phayao",
  chiangrai: "Chiang Rai",
  maehongson: "Mae Hong Son",
  ratchaburi: "Ratchaburi",
  kanchanaburi: "Kanchanaburi",
  tak: "Tak",
  sukhothai: "Sukhothai",
  phitsanulok: "Phitsanulok",
  phichit: "Phichit",
  phetchabun: "Phetchabun",
  kamphaengphet: "Kamphaengphet",
  nakhonsawan: "Nakhon Sawan",
  uthaithani: "Uthai Thani",
  nakhonratchasima: "Nakhon Ratchasima", korat: "Nakhon Ratchasima",
  buriram: "Buri Ram",
  surin: "Surin",
  sisaket: "Si Sa Ket",
  ubonratchathani: "Ubon Ratchathani",
  yasothon: "Yasothon",
  amnatcharoen: "Amnat Charoen",
  chiyaphum: "Chaiyaphum", chaiyaphum: "Chaiyaphum",
  khonkaen: "Khon Kaen",
  udonthani: "Udon Thani",
  loei: "Loei",
  nongkhai: "Nong Khai",
  nongbualamphu: "Nong Bua Lam Phu",
  kalasin: "Kalasin",
  mahasarakham: "Maha Sarakham",
  roiet: "Roi Et",
  sakonnakhon: "Sakon Nakhon",
  nakhonphanom: "Nakhon Phanom",
  buengkan: "Bueng Kan",
  mukdahan: "Mukdahan",
  chumphon: "Chumphon",
  ranong: "Ranong",
  surathani: "Surat Thani", suratthani: "Surat Thani",
  phangnga: "Phang Nga",
  phuket: "Phuket",
  krabi: "Krabi",
  nakhonsithammarat: "Nakhon Si Thammarat",
  trang: "Trang",
  phatthalung: "Phatthalung",
  satun: "Satun",
  songkhla: "Songkhla", hatyai: "Songkhla",
  pattani: "Pattani",
  yala: "Yala",
  narathiwat: "Narathiwat",
};

/**
 * Resolves various location string inputs to a standard English province name.
 * Handles Thai, English, common aliases, and formats like "City, Province".
 * Returns null if no valid province can be determined.
 */
export function resolveProvinceName(input: string | number | null | undefined): string | null {
  const strInput = String(input || "").trim();
  if (!strInput || strInput.toLowerCase() === 'n/a') return null;

  const parts = strInput.split(",").map(s => s.trim()).filter(Boolean);
  const candidateRaw = parts.length ? parts[parts.length - 1] : strInput;
  const thCandidate = candidateRaw.replace(/^จังหวัด\s*/u, "").trim();

  // 1. Resolve Thai input to standard English name
  if (/[\u0E00-\u0E7F]/.test(thCandidate)) {
    const exactTH =
      TH_PROVINCES.find(p => p === thCandidate) ||
      TH_PROVINCES.find(p => p === thCandidate.replace(/\s/g, ""));
    if (exactTH && TH_TO_EN[exactTH]) {
      return TH_TO_EN[exactTH];
    }
  }

  // 2. Resolve English/Romanized input to standard English name
  const key = normalize(candidateRaw);
  if (ALIAS_TO_EN[key]) {
    return ALIAS_TO_EN[key];
  }
  const standardEnMatch = EN_PROVINCES.find(p => p.toLowerCase() === candidateRaw.toLowerCase());
  if (standardEnMatch) {
      return standardEnMatch;
  }


  // 3. Fallback for concatenated strings, e.g., "Pak Kret Nonthaburi"
  const tokens = normalize(strInput).split(/(?=[A-Z])|\s+/);
  for (let i = tokens.length; i >= 0; i--) {
    const tail = normalize(tokens.slice(i).join(""));
    if (ALIAS_TO_EN[tail]) {
      return ALIAS_TO_EN[tail];
    }
  }
  
  // 4. If no match is found, return null
  return null;
}

/** Aggregates order counts by province from raw data rows. */
export function buildByProvince<T extends { ApproxLocation?: string; Province?: string }>(
  rows: T[]
): Record<string, number> {
  const acc: Record<string, number> = {};
  for (const r of rows) {
    const resolved =
      resolveProvinceName(r.ApproxLocation || r.Province || "") || "Unknown Province";
    acc[resolved] = (acc[resolved] || 0) + 1;
  }
  return acc;
}
