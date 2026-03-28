
export const STORES = [
  { id: 'BLR-01', name: 'Bangalore Hub', city: 'Bangalore', region: 'South' },
  { id: 'MUM-02', name: 'Mumbai Express', city: 'Mumbai', region: 'West' },
  { id: 'DEL-03', name: 'Delhi Central', city: 'Delhi', region: 'North' },
  { id: 'MAA-04', name: 'Chennai Coastal', city: 'Chennai', region: 'South' },
];

export const SKUS = [
  { 
    id: 'SKU-001', 
    name: 'Organic Milk (1L)', 
    category: 'Dairy', 
    baseVelocity: 1.5, 
    sellingPrice: 75.00, 
    costPrice: 48.75, 
    margin: 0.35, 
    reorderPoint: 20,
    supplierName: 'DairyFresh' 
  },
  { 
    id: 'SKU-002', 
    name: 'Artisan Bread', 
    category: 'Bakery', 
    baseVelocity: 1.2, 
    sellingPrice: 95.00, 
    costPrice: 52.25, 
    margin: 0.45, 
    reorderPoint: 15,
    supplierName: 'Sunrise Bakeries' 
  },
  { 
    id: 'SKU-003', 
    name: 'Farm Eggs (12pk)', 
    category: 'Dairy', 
    baseVelocity: 1.0, 
    sellingPrice: 120.00, 
    costPrice: 90.00, 
    margin: 0.25, 
    reorderPoint: 10,
    supplierName: 'Local Farms' 
  },
  { 
    id: 'SKU-004', 
    name: 'Sunflower Oil (1L)', 
    category: 'Pantry', 
    baseVelocity: 0.6, 
    sellingPrice: 185.00, 
    costPrice: 148.00, 
    margin: 0.20, 
    reorderPoint: 5,
    supplierName: 'Global Oils' 
  },
  { 
    id: 'SKU-005', 
    name: 'Spring Water (1L)', 
    category: 'Beverages', 
    baseVelocity: 2.2, 
    sellingPrice: 20.00, 
    costPrice: 8.00, 
    margin: 0.60, 
    reorderPoint: 30,
    supplierName: 'AquaPure' 
  },
  { 
    id: 'SKU-006', 
    name: 'Basmati Rice (1kg)', 
    category: 'Pantry', 
    baseVelocity: 0.4, 
    sellingPrice: 140.00, 
    costPrice: 119.00, 
    margin: 0.15, 
    reorderPoint: 8,
    supplierName: 'RiceMasters' 
  },
  { 
    id: 'SKU-007', 
    name: 'Amul Butter (500g)', 
    category: 'Dairy', 
    baseVelocity: 0.8, 
    sellingPrice: 265.00, 
    costPrice: 185.50, 
    margin: 0.30, 
    reorderPoint: 12,
    supplierName: 'Amul' 
  },
  { 
    id: 'SKU-008', 
    name: 'Toor Dal (1kg)', 
    category: 'Pantry', 
    baseVelocity: 0.3, 
    sellingPrice: 160.00, 
    costPrice: 124.80, 
    margin: 0.22, 
    reorderPoint: 6,
    supplierName: 'AgroGold' 
  },
  { 
    id: 'SKU-009', 
    name: 'Fresh Tomatoes (1kg)', 
    category: 'Produce', 
    baseVelocity: 1.4, 
    sellingPrice: 40.00, 
    costPrice: 20.00, 
    margin: 0.50, 
    reorderPoint: 15,
    supplierName: 'VeggieLink' 
  },
  { 
    id: 'SKU-010', 
    name: 'Coca-Cola (500ml)', 
    category: 'Beverages', 
    baseVelocity: 1.8, 
    sellingPrice: 40.00, 
    costPrice: 18.00, 
    margin: 0.55, 
    reorderPoint: 25,
    supplierName: 'Coca-Cola Co' 
  },
];

export const INITIAL_INVENTORY = SKUS.map(sku => ({
  ...sku,
  currentStock: Math.floor(Math.random() * 50) + 30,
  predictedDemand4Hours: Math.floor(Math.random() * 20) + 5,
  status: 'healthy' as const,
  unitPrice: sku.sellingPrice, // Backwards compatibility with previous UI logic
}));
