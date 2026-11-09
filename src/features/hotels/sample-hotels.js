import { getSiteAssetUrl } from "../../utils/site-assets.js";

export const sampleHotels = [
  {
    id: "azure-cove",
    name: "Azure Cove Retreat",
    location: "Sample stay · Lisbon, Portugal",
    description:
      "A breezy coastal hideaway inspired by tiled streets, long lunches, and Atlantic sunsets.",
    style: "coastal",
    imageUrl:
      "https://euccwinysxbwtbjwykkc.supabase.co/storage/v1/object/public/hotel-images/azure-cove.jpg",
    photoCredit: "Justin W Flory",
    photoLicense: "CC BY-SA 3.0",
    photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    photoSource:
      "https://commons.wikimedia.org/wiki/File:Seaside_In_Dubrovnik_(208105323).jpeg",
    highlights: ["Ocean-inspired", "Slow mornings"],
    nightlyRate: 229,
    amenities: ["Sea-view terrace", "Outdoor pool", "Breakfast concept", "Complimentary Wi-Fi"],
  },
  {
    id: "alpine-hearth",
    name: "Alpine Hearth Lodge",
    location: "Sample stay · Innsbruck, Austria",
    description:
      "A warm mountain lodge concept with timber details and trails just beyond the door.",
    style: "alpine",
    imageUrl:
      "https://euccwinysxbwtbjwykkc.supabase.co/storage/v1/object/public/hotel-images/alpine-hearth.jpg",
    photoCredit: "Naturpuur",
    photoLicense: "CC BY-SA 4.0",
    photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    photoSource:
      "https://commons.wikimedia.org/wiki/File:Alpine_Peaks_Hotel,_Turracher_H%C3%B6he,_Gde._Stadl-Predlitz,_Steiermark,_Austria_02.jpg",
    highlights: ["Mountain air", "Made for unwinding"],
    nightlyRate: 198,
    amenities: ["Mountain views", "Sauna", "Trail access", "Breakfast concept"],
  },
  {
    id: "maison-verdi",
    name: "Maison Verdi",
    location: "Sample stay · Florence, Italy",
    description:
      "An intimate city retreat imagined around garden courtyards and thoughtful design.",
    style: "garden",
    imageUrl:
      "https://euccwinysxbwtbjwykkc.supabase.co/storage/v1/object/public/hotel-images/maison-verdi.jpg",
    photoCredit: "jaycross",
    photoLicense: "CC BY 2.0",
    photoLicenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    photoSource:
      "https://commons.wikimedia.org/wiki/File:Villa_san_michele_fiesole_00.jpg",
    highlights: ["Courtyard calm", "Design-led"],
    nightlyRate: 185,
    amenities: ["Garden courtyard", "Lounge", "Walkable location", "Complimentary Wi-Fi"],
  },
  {
    id: "meridian-house",
    name: "Meridian House",
    location: "Sample stay · Copenhagen, Denmark",
    description:
      "A modern urban stay concept balancing Nordic simplicity with a lively neighborhood.",
    style: "city",
    imageUrl:
      "https://euccwinysxbwtbjwykkc.supabase.co/storage/v1/object/public/hotel-images/meridian-house.jpg",
    photoCredit: "Dietmar Rabich",
    photoLicense: "CC BY-SA 4.0",
    photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    photoSource:
      "https://commons.wikimedia.org/wiki/File:Kopenhagen_(DK),_Copenhagen_Admiral_Hotel_--_2017_--_1712.jpg",
    highlights: ["City address", "Nordic-inspired"],
    nightlyRate: 210,
    amenities: ["City-center setting", "Restaurant concept", "Fitness room", "Complimentary Wi-Fi"],
  },
  {
    id: "caldera-lantern",
    name: "Caldera Lantern Retreat",
    location: "Sample stay · Perissa, Santorini, Greece",
    description:
      "A sunlit island escape concept with bright Cycladic architecture and a relaxed coastal rhythm.",
    style: "coastal",
    imageUrl:
      "https://euccwinysxbwtbjwykkc.supabase.co/storage/v1/object/public/hotel-images/santorini-cove.jpg",
    photoCredit: "Norbert Nagel",
    photoLicense: "CC BY-SA 3.0",
    photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    photoSource:
      "https://commons.wikimedia.org/wiki/File:Hotel_Anastasia_Princess_-_Perissa_-_Santorini_-_Greece_-_01.jpg",
    highlights: ["Island light", "By the Aegean"],
    nightlyRate: 170,
    amenities: ["Aegean views", "Outdoor pool", "Private balcony", "Breakfast concept"],
  },
  {
    id: "golden-lane-house",
    name: "Golden Lane House",
    location: "Sample stay · Prague, Czech Republic",
    description:
      "A city-stay concept inspired by Prague's historic lanes, warm stone, and evening strolls.",
    style: "city",
    imageUrl:
      "https://euccwinysxbwtbjwykkc.supabase.co/storage/v1/object/public/hotel-images/prague-golden-lane.jpg",
    photoCredit: "Estec Co.Ltd, Prague Hotel Operator",
    photoLicense: "CC BY 3.0",
    photoLicenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    photoSource: "https://commons.wikimedia.org/wiki/File:Prague_gold_alley.jpg",
    highlights: ["Old-town walks", "City character"],
    nightlyRate: 155,
    amenities: ["Historic district", "Courtyard lounge", "Local dining nearby", "Complimentary Wi-Fi"],
  },
  {
    id: "palma-verde",
    name: "Palma Verde Wellness",
    location: "Sample stay · Portals Nous, Mallorca, Spain",
    description:
      "A garden resort concept for slow afternoons, Mediterranean greenery, and a restorative stay.",
    style: "garden",
    imageUrl:
      "https://euccwinysxbwtbjwykkc.supabase.co/storage/v1/object/public/hotel-images/palma-garden.jpg",
    photoCredit: "Lindner Hotels AG",
    photoLicense: "CC BY-SA 3.0",
    photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    photoSource:
      "https://commons.wikimedia.org/wiki/File:Lindner_Golf_%26_Wellness_Resort_Portals_Nous.jpg",
    highlights: ["Garden setting", "Wellness-inspired"],
    nightlyRate: 190,
    amenities: ["Wellness area", "Outdoor pool", "Garden paths", "Yoga studio"],
  },
  {
    id: "maison-mezzara",
    name: "Maison Mezzara",
    location: "Sample stay \u00b7 Paris, France",
    description:
      "A Parisian city-stay concept inspired by expressive architecture and relaxed neighborhood walks.",
    style: "garden",
    imageUrl:
      "https://euccwinysxbwtbjwykkc.supabase.co/storage/v1/object/public/hotel-images/paris-mezzara.jpg",
    photoCredit: "Davitof",
    photoLicense: "CC BY-SA 3.0",
    photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    photoSource:
      "https://commons.wikimedia.org/wiki/File:Paris_-_Hotel_Mezzara_(2).jpg",
    highlights: ["Parisian character", "Art nouveau inspired"],
    nightlyRate: 225,
    amenities: ["Art Nouveau setting", "Garden lounge", "Walkable location", "Complimentary Wi-Fi"],
  },
];

const unsplashImage = (id) =>
  getSiteAssetUrl(`gallery/${id}.jpg`) ??
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;

export const sampleHotelGalleryByStyle = {
  coastal: [
    { src: unsplashImage("photo-1566073771259-6a8506099945"), alt: "Resort pool beside the hotel" },
    { src: unsplashImage("photo-1571896349842-33c89424de2d"), alt: "Pool and lounge area" },
    { src: unsplashImage("photo-1540541338287-41700207dee6"), alt: "Sunlit resort amenities" },
    { src: unsplashImage("photo-1584132967334-10e028bd69f7"), alt: "Outdoor pool and terrace" },
  ],
  alpine: [
    { src: unsplashImage("photo-1542314831-068cd1dbfeeb"), alt: "Hotel exterior surrounded by scenery" },
    { src: unsplashImage("photo-1578683010236-d716f9a3f461"), alt: "Warm, comfortable guest room" },
    { src: unsplashImage("photo-1564501049412-61c2a3083791"), alt: "Hotel lounge and guest amenities" },
    { src: unsplashImage("photo-1566665797739-1674de7a421a"), alt: "Quiet hotel bedroom" },
  ],
  garden: [
    { src: unsplashImage("photo-1618221195710-dd6b41faaea6"), alt: "Thoughtfully designed interior lounge" },
    { src: unsplashImage("photo-1600210492486-724fe5c67fb0"), alt: "Relaxing hotel sitting area" },
    { src: unsplashImage("photo-1540518614846-7eded433c457"), alt: "Bright bedroom with comfortable bedding" },
    { src: unsplashImage("photo-1564013799919-ab600027ffc6"), alt: "Elegant guest room interior" },
  ],
  city: [
    { src: unsplashImage("photo-1611892440504-42a792e24d32"), alt: "Modern hotel room with a city feel" },
    { src: unsplashImage("photo-1582719508461-905c673771fd"), alt: "Hotel room and guest amenities" },
    { src: unsplashImage("photo-1551882547-ff40c63fe5fa"), alt: "Hotel interior and lounge" },
    { src: unsplashImage("photo-1590490360182-c33d57733427"), alt: "Comfortable city hotel bedroom" },
  ],
};
