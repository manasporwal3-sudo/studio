
export const STORES = [
  { id: 'BLR-01', name: 'Bangalore Hub', city: 'Bangalore', region: 'South' },
  { id: 'MUM-02', name: 'Mumbai Express', city: 'Mumbai', region: 'West' },
  { id: 'DEL-03', name: 'Delhi Central', city: 'Delhi', region: 'North' },
  { id: 'MAA-04', name: 'Chennai Coastal', city: 'Chennai', region: 'South' },
];

export const SKUS = [
  { id: 'SKU-001', name: 'Organic Milk (1L)', category: 'Dairy', baseVelocity: 1.5, unitPrice: 2.50, margin: 0.35, supplierName: 'DairyFresh' },
  { id: 'SKU-002', name: 'Artisan Bread', category: 'Bakery', baseVelocity: 1.2, unitPrice: 3.20, margin: 0.45, supplierName: 'Sunrise Bakeries' },
  { id: 'SKU-003', name: 'Farm Eggs (12pk)', category: 'Dairy', baseVelocity: 1.0, unitPrice: 4.50, margin: 0.25, supplierName: 'Local Farms' },
  { id: 'SKU-004', name: 'Sunflower Oil (1L)', category: 'Pantry', baseVelocity: 0.6, unitPrice: 5.80, margin: 0.20, supplierName: 'Global Oils' },
  { id: 'SKU-005', name: 'Spring Water (1L)', category: 'Beverages', baseVelocity: 2.2, unitPrice: 1.20, margin: 0.60, supplierName: 'AquaPure' },
  { id: 'SKU-006', name: 'Basmati Rice (1kg)', category: 'Pantry', baseVelocity: 0.4, unitPrice: 6.50, margin: 0.15, supplierName: 'RiceMasters' },
  { id: 'SKU-007', name: 'Amul Butter (500g)', category: 'Dairy', baseVelocity: 0.8, unitPrice: 4.20, margin: 0.30, supplierName: 'Amul' },
  { id: 'SKU-008', name: 'Toor Dal (1kg)', category: 'Pantry', baseVelocity: 0.3, unitPrice: 3.80, margin: 0.22, supplierName: 'AgroGold' },
  { id: 'SKU-009', name: 'Fresh Tomatoes (1kg)', category: 'Produce', baseVelocity: 1.4, unitPrice: 1.80, margin: 0.50, supplierName: 'VeggieLink' },
  { id: 'SKU-010', name: 'Coca-Cola (500ml)', category: 'Beverages', baseVelocity: 1.8, unitPrice: 0.95, margin: 0.55, supplierName: 'Coca-Cola Co' },
];

export const INITIAL_INVENTORY = SKUS.map(sku => ({
  ...sku,
  currentStock: Math.floor(Math.random() * 50) + 30,
  predictedDemand4Hours: Math.floor(Math.random() * 20) + 5,
  status: 'healthy' as const,
}));
