export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  status: "new" | "replied" | "closed";
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  featured: boolean;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
}

export interface Review {
  id: string;
  clientName: string;
  message: string;
  rating: number;
  image?: string;
}

export const mockInquiries: Inquiry[] = [
  {
    id: "inq-1",
    name: "Isabelle Marchetti",
    email: "isabelle@example.com",
    phone: "+1 (555) 201-4821",
    message:
      "I'm interested in a custom walnut dining table for a 12-person setting. Could you provide a quote and lead time?",
    date: "2026-04-08",
    status: "new",
  },
  {
    id: "inq-2",
    name: "Thomas Beaumont",
    email: "t.beaumont@example.com",
    phone: "+1 (555) 374-9012",
    message:
      "Looking for a bespoke Chesterfield sofa in cognac leather. Do you offer that finish?",
    date: "2026-04-07",
    status: "replied",
  },
  {
    id: "inq-3",
    name: "Sofia Delacroix",
    email: "sofia.d@example.com",
    phone: "+44 20 7946 0823",
    message:
      "We are furnishing a penthouse and would love a complete consultation for living and dining areas.",
    date: "2026-04-06",
    status: "new",
  },
  {
    id: "inq-4",
    name: "Marcus Holloway",
    email: "m.holloway@design.co",
    phone: "+1 (555) 482-3319",
    message:
      "I need fabric swatches for the Lyon sectional before committing to an order. Can you send samples?",
    date: "2026-04-05",
    status: "replied",
  },
  {
    id: "inq-5",
    name: "Priya Nair",
    email: "priya.n@interiors.in",
    phone: "+91 98765 43210",
    message:
      "Interested in your brass accent lighting collection. What are current stock levels?",
    date: "2026-04-04",
    status: "closed",
  },
  {
    id: "inq-6",
    name: "Julian Ferrara",
    email: "julian.f@example.com",
    phone: "+39 06 4567 8901",
    message:
      "We'd like to discuss a commercial project — 40-room boutique hotel lobby and suites.",
    date: "2026-04-03",
    status: "new",
  },
  {
    id: "inq-7",
    name: "Amelia Forsythe",
    email: "aforsythe@realty.com",
    phone: "+1 (555) 619-7720",
    message:
      "Staging three luxury apartments in Manhattan. Looking for a curated package deal.",
    date: "2026-04-02",
    status: "replied",
  },
  {
    id: "inq-8",
    name: "Chen Wei",
    email: "chenwei@luxliving.cn",
    phone: "+86 138 0013 8000",
    message:
      "Do you ship to Shanghai? Interested in the Avante bed frame in white oak.",
    date: "2026-04-01",
    status: "new",
  },
  {
    id: "inq-9",
    name: "Lucía Romero",
    email: "lucia.r@example.es",
    phone: "+34 91 234 5678",
    message:
      "Can the Riviera bookcase be made to a custom height of 280cm for our library?",
    date: "2026-03-30",
    status: "closed",
  },
  {
    id: "inq-10",
    name: "Ethan Blackwood",
    email: "ethan.b@studio.io",
    phone: "+1 (555) 758-4490",
    message:
      "Would love to visit your showroom next Thursday. Are appointments required?",
    date: "2026-03-28",
    status: "replied",
  },
];

export const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Seating",
    slug: "seating",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
  },
  {
    id: "cat-2",
    name: "Dining",
    slug: "dining",
    image:
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&q=80",
  },
  {
    id: "cat-3",
    name: "Bedroom",
    slug: "bedroom",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80",
  },
  {
    id: "cat-4",
    name: "Storage",
    slug: "storage",
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&q=80",
  },
  {
    id: "cat-5",
    name: "Lighting",
    slug: "lighting",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80",
  },
];

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "Lyon Sectional Sofa",
    description:
      "Deep-seated corner sofa in sand-coloured bouclé with solid oak legs.",
    price: 4850,
    category: "Seating",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    featured: true,
  },
  {
    id: "prod-2",
    name: "Avante Bed Frame",
    description:
      "Minimalist platform bed in white oak with integrated nightstand shelves.",
    price: 2990,
    category: "Bedroom",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80",
    featured: true,
  },
  {
    id: "prod-3",
    name: "Walnut Dining Table",
    description:
      "Solid European walnut slab dining table, seats 8–10, handcrafted to order.",
    price: 6200,
    category: "Dining",
    image:
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80",
    featured: false,
  },
  {
    id: "prod-4",
    name: "Riviera Bookcase",
    description:
      "Open shelving bookcase in powder-coated steel and tempered glass.",
    price: 1680,
    category: "Storage",
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80",
    featured: false,
  },
  {
    id: "prod-5",
    name: "Chesterfield Armchair",
    description:
      "Button-tufted cognac leather armchair with handcut brass nailhead trim.",
    price: 3200,
    category: "Seating",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
    featured: true,
  },
  {
    id: "prod-6",
    name: "Cascade Pendant Light",
    description:
      "Brushed brass pendant with hand-blown amber glass globe, dimmable.",
    price: 890,
    category: "Lighting",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80",
    featured: false,
  },
  {
    id: "prod-7",
    name: "Palermo Console Table",
    description: "Slender marble-top console on bronzed steel hairpin legs.",
    price: 1950,
    category: "Dining",
    image:
      "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=600&q=80",
    featured: false,
  },
  {
    id: "prod-8",
    name: "Oslo Wardrobe",
    description:
      "Floor-to-ceiling wardrobe system in smoked ash with push-to-open doors.",
    price: 5400,
    category: "Bedroom",
    image:
      "https://images.unsplash.com/photo-1558997519-83ea9252edc8?w=600&q=80",
    featured: true,
  },
];

export const mockGallery: GalleryItem[] = [
  {
    id: "gal-1",
    url: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80",
    caption: "Penthouse Living Room — Milan",
  },
  {
    id: "gal-2",
    url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
    caption: "Reading Nook — Paris Apartment",
  },
  {
    id: "gal-3",
    url: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80",
    caption: "Open-Plan Kitchen & Dining — London",
  },
  {
    id: "gal-4",
    url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80",
    caption: "Master Suite — Monaco Villa",
  },
  {
    id: "gal-5",
    url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    caption: "Walk-in Wardrobe — Dubai Penthouse",
  },
  {
    id: "gal-6",
    url: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80",
    caption: "Dining Room — Manhattan Loft",
  },
  {
    id: "gal-7",
    url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    caption: "Family Lounge — Hamptons Beach House",
  },
  {
    id: "gal-8",
    url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80",
    caption: "Home Office — Berlin Townhouse",
  },
  {
    id: "gal-9",
    url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80",
    caption: "Entryway — Geneva Chalet",
  },
  {
    id: "gal-10",
    url: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=600&q=80",
    caption: "Powder Room — Hong Kong Flat",
  },
  {
    id: "gal-11",
    url: "https://images.unsplash.com/photo-1558997519-83ea9252edc8?w=600&q=80",
    caption: "Dressing Room — Tokyo Residence",
  },
  {
    id: "gal-12",
    url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=600&q=80",
    caption: "Terrace Lounge — Amalfi Retreat",
  },
];

export const mockReviews: Review[] = [
  {
    id: "rev-1",
    clientName: "Isabelle Fontaine",
    message:
      "Absolutely impeccable craftsmanship. The walnut dining table arrived and transformed our home instantly. Every guest asks about it.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b5b4?w=200&q=80",
  },
  {
    id: "rev-2",
    clientName: "James Whitmore",
    message:
      "Superb quality and the delivery team were professional and careful. The Chesterfield armchair is a statement piece.",
    rating: 5,
  },
  {
    id: "rev-3",
    clientName: "Camille Dubois",
    message:
      "The bouclé sectional is even more beautiful in person than in the photos. Highly recommend the design consultation service.",
    rating: 4,
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
  },
  {
    id: "rev-4",
    clientName: "Raj Kapoor",
    message:
      "Great product, slightly longer lead time than expected but the end result was worth every day of waiting.",
    rating: 4,
  },
  {
    id: "rev-5",
    clientName: "Natasha Volkov",
    message:
      "Our hotel lobby has been completely transformed with LuxeAdmin pieces. Guests consistently compliment the atmosphere.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80",
  },
  {
    id: "rev-6",
    clientName: "Lorenzo Esposito",
    message:
      "The Oslo wardrobe fit our space perfectly and the push-to-open mechanism is silently smooth. Pure luxury.",
    rating: 5,
  },
];

export const mockStats = {
  totalVisits: 12840,
  totalInquiries: 247,
  featuredProducts: mockProducts.filter((p) => p.featured).length,
  galleryImages: mockGallery.length,
};
