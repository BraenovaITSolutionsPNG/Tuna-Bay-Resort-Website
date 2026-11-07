import 'dotenv/config'
import bcrypt from 'bcryptjs'

// Create a simple mock SQL implementation for development
const mockData = {
  users: [],
  bookings: [],
  rooms: [],
  facilities: [],
  menu_items: [],
  gallery_images: [],
  testimonials: [],
  settings: []
}

// Initialize mock database with seed data
async function initializeMockDatabase() {
  // Seed rooms if empty
  if (mockData.rooms.length === 0) {
    mockData.rooms.push(
      { id: 1, name: 'Standard Room', description: 'Comfortable coastal rooms', price: 'K450/night', features: 'Queen Bed, AC, Private Bathroom, WiFi', image: '/images/tuna-bay-waterfront.png' },
      { id: 2, name: 'Deluxe Room', description: 'Spacious rooms with garden views', price: 'K550/night', features: 'King Bed, AC, Private Bathroom, WiFi, Balcony', image: '/images/tuna-bay-hero.jpg' },
      { id: 3, name: 'Ocean View Suite', description: 'Stunning ocean views with separate living area', price: 'K750/night', features: 'King Bed, Living Area, Ocean View, AC, WiFi', image: '/images/tuna-bay-waterfront.png' },
      { id: 4, name: 'Family Room', description: 'Generous space for families', price: 'K650/night', features: '2 Queen Beds, Family Space, AC, Private Bathroom, WiFi', image: '/images/tuna-bay-hero.jpg' },
      { id: 5, name: 'Beachfront Villa', description: 'Ultimate luxury with direct beach access', price: 'K950/night', features: 'King Bed, Private Villa, Beach Access, AC, WiFi, Kitchenette', image: '/images/tuna-bay-waterfront.png' }
    )
  }

  // Seed facilities if empty
  if (mockData.facilities.length === 0) {
    mockData.facilities.push(
      { id: 1, title: 'Resort Rooms', text: 'Comfortable accommodation', image: '/images/tuna-bay-waterfront.png' },
      { id: 2, title: 'Resort Swimming Pool', text: 'A spacious outdoor pool', image: '/images/tuna-bay-hero.jpg' },
      { id: 3, title: 'Waterfront Jetty', text: 'Direct access to the bay', image: '/images/tuna-bay-waterfront.png' },
      { id: 4, title: 'Restaurant & Bar', text: 'Covered, open-air dining', image: '/images/tuna-bay-hero.jpg' },
      { id: 5, title: 'Function Spaces', text: 'Flexible indoor and outdoor areas', image: '/images/tuna-bay-waterfront.png' }
    )
  }

  // Seed menu if empty
  if (mockData.menu_items.length === 0) {
    mockData.menu_items.push(
      { id: 1, category: 'dining', name: 'Tuna Bay Seafood Basket', description: 'Crispy fish, prawns, calamari', price: 'K85' },
      { id: 2, category: 'dining', name: 'Chargrilled Reef Fish', description: 'Seasonal catch', price: 'K72' },
      { id: 3, category: 'dining', name: 'Coconut Prawn Curry', description: 'Local prawns, coconut curry', price: 'K65' },
      { id: 4, category: 'drinks', name: 'Tropical Fruit Cooler', description: 'Pineapple, passionfruit', price: 'K18' },
      { id: 5, category: 'hire', name: 'Family Day Pass', description: 'Weekend entry', price: 'K60' }
    )
  }

  // Seed gallery if empty
  if (mockData.gallery_images.length === 0) {
    mockData.gallery_images.push(
      { id: 1, src: '/images/tuna-bay-hero.jpg', alt: 'Aerial view of pool', title: 'Poolside days' },
      { id: 2, src: '/images/tuna-bay-waterfront.png', alt: 'Waterfront jetty', title: 'The waterfront' }
    )
  }

  // Seed testimonials if empty
  if (mockData.testimonials.length === 0) {
    mockData.testimonials.push(
      { id: 1, name: 'Sarah K.', text: 'A wonderful escape from the city.', rating: 5, approved: true },
      { id: 2, name: 'Mark T.', text: 'Perfect venue for our family gathering.', rating: 5, approved: true }
    )
  }

  // Create admin user
  if (mockData.users.length === 0) {
    const bcryptHash = (p: string) => bcrypt.hashSync(p, 10)
    mockData.users.push(
      { id: 1, email: 'admin@tunabay.com', password_hash: bcryptHash(process.env.ADMIN_SEED_PASSWORD || 'admin123'), name: 'Admin', role: 'admin' },
      { id: 2, email: 'staff@tunabay.com', password_hash: bcryptHash(process.env.STAFF_SEED_PASSWORD || 'staff123'), name: 'Staff', role: 'staff' }
    )
  }
}

initializeMockDatabase().catch(console.error)

let sql = async (query: string, params?: any[]) => {
  const queryLower = query.toLowerCase().trim()
  
  if (queryLower.includes('create table')) {
    // Silently accept table creation in dev
    return []
  }
  
  if (queryLower.includes('select')) {
    const tableMatch = query.match(/from (\w+)/i)
    if (tableMatch && mockData[tableMatch[1] as keyof typeof mockData]) {
      return mockData[tableMatch[1] as keyof typeof mockData]
    }
    return []
  }
  
  if (queryLower.includes('insert')) {
    const tableMatch = query.match(/into (\w+)/i)
    if (tableMatch && params && params.length > 0) {
      const tableName = tableMatch[1]
      if (mockData[tableName as keyof typeof mockData]) {
        const id = mockData[tableName as keyof typeof mockData].length + 1
        mockData[tableName as keyof typeof mockData].push({ id, ...params[0] })
        return [{ id }]
      }
    }
    return []
  }
  
  if (queryLower.includes('update')) {
    return []
  }
  
  if (queryLower.includes('delete')) {
    return []
  }
  
  console.log('Mock SQL executed:', query, params)
  return []
}

export default sql