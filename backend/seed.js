/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║          EventMS — Database Seed Script                  ║
 * ║  Run: node seed.js                                       ║
 * ║  Clears all collections and inserts fresh dummy data     ║
 * ╚══════════════════════════════════════════════════════════╝
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User       from "./models/user.model.js";
import Product    from "./models/Product.model.js";
import Order      from "./models/Order.model.js";
import Cart       from "./models/Cart.model.js";
import Membership from "./models/Membership.model.js";
import Event      from "./models/Event.model.js";
import Booking    from "./models/Booking.model.js";
import GuestList  from "./models/GuestList.model.js";

dotenv.config();

// ─── helpers ────────────────────────────────────────────────
const hash = (pw) => bcrypt.hashSync(pw, 10);
const daysFromNow = (n) => new Date(Date.now() + n * 86_400_000);
const daysAgo     = (n) => new Date(Date.now() - n * 86_400_000);
const pick        = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand        = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── connect ────────────────────────────────────────────────
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB:", process.env.MONGO_URI);

// ─── wipe ───────────────────────────────────────────────────
await Promise.all([
  User.deleteMany({}),
  Product.deleteMany({}),
  Order.deleteMany({}),
  Cart.deleteMany({}),
  Membership.deleteMany({}),
  Event.deleteMany({}),
  Booking.deleteMany({}),
  GuestList.deleteMany({}),
]);
console.log("🗑️  All collections cleared");

// ════════════════════════════════════════════════════════════
// 1. USERS
// ════════════════════════════════════════════════════════════
const pw = hash("password123");

const adminUser = await User.create({
  name: "Super Admin",
  email: "admin@ems.com",
  password: pw,
  role: "admin",
});

const vendors = await User.insertMany([
  { name: "Priya Catering Co.",    email: "priya@vendor.com",   password: pw, role: "vendor", category: "food"        },
  { name: "TechStage Events",      email: "techstage@vendor.com",password: pw, role: "vendor", category: "electronics" },
  { name: "Royal Wedding Planners",email: "royal@vendor.com",   password: pw, role: "vendor", category: "wedding"     },
  { name: "FreshMart Grocery",     email: "freshmart@vendor.com",password: pw, role: "vendor", category: "grocery"    },
  { name: "StyleHub Fashion",      email: "stylehub@vendor.com", password: pw, role: "vendor", category: "fashion"    },
  { name: "MediCare Supplies",     email: "medicare@vendor.com", password: pw, role: "vendor", category: "medicine"   },
]);

const users = await User.insertMany([
  { name: "Arjun Mehta",    email: "arjun@user.com",   password: pw, role: "user" },
  { name: "Sneha Patel",    email: "sneha@user.com",   password: pw, role: "user" },
  { name: "Rohan Gupta",    email: "rohan@user.com",   password: pw, role: "user" },
  { name: "Kavya Sharma",   email: "kavya@user.com",   password: pw, role: "user" },
  { name: "Vikram Singh",   email: "vikram@user.com",  password: pw, role: "user" },
  { name: "Ananya Reddy",   email: "ananya@user.com",  password: pw, role: "user" },
  { name: "Rahul Joshi",    email: "rahul@user.com",   password: pw, role: "user" },
  { name: "Pooja Nair",     email: "pooja@user.com",   password: pw, role: "user" },
]);

console.log(`👤 Created: 1 admin, ${vendors.length} vendors, ${users.length} users`);

// ════════════════════════════════════════════════════════════
// 2. PRODUCTS
// ════════════════════════════════════════════════════════════
const productData = [
  // Food vendor (vendors[0])
  { name: "Paneer Tikka Platter",   price: 450,  status: "available", vendorId: vendors[0]._id },
  { name: "Veg Biryani (serves 4)", price: 680,  status: "available", vendorId: vendors[0]._id },
  { name: "Gulab Jamun Box (20pc)", price: 280,  status: "available", vendorId: vendors[0]._id },
  { name: "Tandoori Chicken",       price: 520,  status: "available", vendorId: vendors[0]._id },
  { name: "Fruit Chaat Bowl",       price: 180,  status: "available", vendorId: vendors[0]._id },

  // Electronics vendor (vendors[1])
  { name: "Wireless Microphone Set",price: 3500, status: "available", vendorId: vendors[1]._id },
  { name: "LED Stage Lights (pair)", price: 2800, status: "available", vendorId: vendors[1]._id },
  { name: "Bluetooth Speaker 80W",  price: 4200, status: "available", vendorId: vendors[1]._id },
  { name: "HDMI Projector 4K",      price: 12000,status: "available", vendorId: vendors[1]._id },
  { name: "Laptop Stand Adjustable",price: 850,  status: "available", vendorId: vendors[1]._id },

  // Wedding vendor (vendors[2])
  { name: "Floral Arch Decoration", price: 8500, status: "available", vendorId: vendors[2]._id },
  { name: "Bridal Mehendi Package", price: 3200, status: "available", vendorId: vendors[2]._id },
  { name: "Wedding Photography",    price: 25000,status: "available", vendorId: vendors[2]._id },
  { name: "Mandap Decoration",      price: 15000,status: "available", vendorId: vendors[2]._id },
  { name: "Invitation Cards (100)", price: 1200, status: "available", vendorId: vendors[2]._id },

  // Grocery vendor (vendors[3])
  { name: "Organic Basmati Rice 5kg",price: 420, status: "available", vendorId: vendors[3]._id },
  { name: "Cold Pressed Coconut Oil",price: 380, status: "available", vendorId: vendors[3]._id },
  { name: "Mixed Dry Fruits 500g",   price: 650, status: "available", vendorId: vendors[3]._id },
  { name: "Whole Wheat Flour 10kg",  price: 340, status: "available", vendorId: vendors[3]._id },
  { name: "Organic Honey 500ml",     price: 290, status: "available", vendorId: vendors[3]._id },

  // Fashion vendor (vendors[4])
  { name: "Designer Saree",          price: 4500, status: "available", vendorId: vendors[4]._id },
  { name: "Sherwani Set (Men)",       price: 6800, status: "available", vendorId: vendors[4]._id },
  { name: "Lehenga Choli",           price: 8200, status: "available", vendorId: vendors[4]._id },
  { name: "Kurta Pajama Set",        price: 1800, status: "available", vendorId: vendors[4]._id },
  { name: "Embroidered Dupatta",     price: 950,  status: "available", vendorId: vendors[4]._id },

  // Medicine vendor (vendors[5])
  { name: "First Aid Kit Complete",  price: 850,  status: "available", vendorId: vendors[5]._id },
  { name: "Sanitizer 5L Bulk",       price: 480,  status: "available", vendorId: vendors[5]._id },
  { name: "Disposable Gloves (100)", price: 220,  status: "available", vendorId: vendors[5]._id },
  { name: "Face Masks N95 (50pc)",   price: 650,  status: "available", vendorId: vendors[5]._id },
  { name: "Pulse Oximeter",          price: 1200, status: "available", vendorId: vendors[5]._id },
];

const products = await Product.insertMany(productData);
console.log(`📦 Created: ${products.length} products`);

// ════════════════════════════════════════════════════════════
// 3. EVENTS
// ════════════════════════════════════════════════════════════
const eventData = [
  // Upcoming events
  {
    title: "Annual Tech Summit 2025",
    description: "India's largest technology conference featuring keynotes from top industry leaders, workshops on AI, cloud computing, and startup pitches. Join 2000+ tech professionals.",
    category: "conference",
    date: daysFromNow(15),
    time: "09:00 AM",
    location: "Bangalore, Karnataka",
    venue: "Bangalore International Exhibition Centre",
    capacity: 500,
    price: 1500,
    status: "upcoming",
    vendorId: vendors[1]._id,
    bookedCount: 312,
  },
  {
    title: "Royal Wedding Expo 2025",
    description: "Discover the finest wedding vendors, decorators, caterers, and planners all under one roof. Get exclusive deals and plan your dream wedding.",
    category: "wedding",
    date: daysFromNow(22),
    time: "11:00 AM",
    location: "Mumbai, Maharashtra",
    venue: "Taj Lands End Ballroom",
    capacity: 300,
    price: 500,
    status: "upcoming",
    vendorId: vendors[2]._id,
    bookedCount: 187,
  },
  {
    title: "Bollywood Night Live Concert",
    description: "An electrifying evening of live Bollywood music featuring top playback singers and dancers. Experience the magic of Bollywood under the stars.",
    category: "concert",
    date: daysFromNow(8),
    time: "07:00 PM",
    location: "Delhi, NCR",
    venue: "Jawaharlal Nehru Stadium",
    capacity: 2000,
    price: 800,
    status: "upcoming",
    vendorId: vendors[0]._id,
    bookedCount: 1456,
  },
  {
    title: "Startup Founders Meetup",
    description: "Network with 200+ startup founders, investors, and mentors. Pitch your idea, find co-founders, and get funded. Includes dinner and networking session.",
    category: "corporate",
    date: daysFromNow(30),
    time: "06:00 PM",
    location: "Hyderabad, Telangana",
    venue: "T-Hub Innovation Campus",
    capacity: 200,
    price: 999,
    status: "upcoming",
    vendorId: vendors[1]._id,
    bookedCount: 89,
  },
  {
    title: "Kids Birthday Carnival",
    description: "A magical birthday carnival experience for kids aged 3-12. Includes rides, games, magic shows, face painting, and unlimited snacks.",
    category: "birthday",
    date: daysFromNow(5),
    time: "10:00 AM",
    location: "Pune, Maharashtra",
    venue: "Fun World Amusement Park",
    capacity: 150,
    price: 350,
    status: "upcoming",
    vendorId: vendors[0]._id,
    bookedCount: 98,
  },
  {
    title: "Food Festival — Taste of India",
    description: "Celebrate the diverse culinary heritage of India with 50+ food stalls, live cooking demonstrations, and cultural performances from 15 states.",
    category: "other",
    date: daysFromNow(12),
    time: "12:00 PM",
    location: "Chennai, Tamil Nadu",
    venue: "Marina Beach Grounds",
    capacity: 1000,
    price: 200,
    status: "upcoming",
    vendorId: vendors[3]._id,
    bookedCount: 634,
  },
  {
    title: "Fashion Week — Spring Collection",
    description: "Witness the latest spring/summer collections from 30 top Indian designers. Red carpet event with celebrity appearances and exclusive after-party.",
    category: "other",
    date: daysFromNow(45),
    time: "05:00 PM",
    location: "Mumbai, Maharashtra",
    venue: "Bandra Kurla Complex",
    capacity: 400,
    price: 2500,
    status: "upcoming",
    vendorId: vendors[4]._id,
    bookedCount: 156,
  },
  {
    title: "Healthcare Innovation Summit",
    description: "Bringing together doctors, healthcare startups, and investors to discuss the future of digital health, telemedicine, and medical AI.",
    category: "conference",
    date: daysFromNow(60),
    time: "09:30 AM",
    location: "Kolkata, West Bengal",
    venue: "Science City Auditorium",
    capacity: 250,
    price: 1200,
    status: "upcoming",
    vendorId: vendors[5]._id,
    bookedCount: 43,
  },

  // Ongoing
  {
    title: "3-Day Yoga & Wellness Retreat",
    description: "Immerse yourself in a transformative 3-day wellness retreat featuring yoga, meditation, Ayurvedic treatments, and organic meals.",
    category: "other",
    date: daysAgo(1),
    time: "06:00 AM",
    location: "Rishikesh, Uttarakhand",
    venue: "Parmarth Niketan Ashram",
    capacity: 80,
    price: 4500,
    status: "ongoing",
    vendorId: vendors[2]._id,
    bookedCount: 72,
  },

  // Completed
  {
    title: "New Year Gala 2025",
    description: "Ring in 2025 with a spectacular gala dinner, live DJ, fireworks, and unlimited food & drinks. Black tie optional.",
    category: "other",
    date: daysAgo(120),
    time: "08:00 PM",
    location: "Goa",
    venue: "Grand Hyatt Goa",
    capacity: 500,
    price: 3500,
    status: "completed",
    vendorId: vendors[0]._id,
    bookedCount: 498,
  },
  {
    title: "Corporate Leadership Workshop",
    description: "A full-day intensive workshop on leadership, team management, and strategic thinking for senior executives.",
    category: "corporate",
    date: daysAgo(45),
    time: "09:00 AM",
    location: "Bangalore, Karnataka",
    venue: "ITC Gardenia Conference Hall",
    capacity: 100,
    price: 2000,
    status: "completed",
    vendorId: vendors[1]._id,
    bookedCount: 95,
  },
  {
    title: "Diwali Mela & Cultural Night",
    description: "Celebrate Diwali with traditional performances, rangoli competitions, fireworks, and authentic festive food.",
    category: "other",
    date: daysAgo(30),
    time: "05:00 PM",
    location: "Jaipur, Rajasthan",
    venue: "Albert Hall Museum Grounds",
    capacity: 800,
    price: 0,
    status: "completed",
    vendorId: vendors[3]._id,
    bookedCount: 756,
  },
];

const events = await Event.insertMany(eventData);
console.log(`🎉 Created: ${events.length} events`);

// ════════════════════════════════════════════════════════════
// 4. BOOKINGS
// ════════════════════════════════════════════════════════════
const bookingStatuses = ["confirmed", "confirmed", "confirmed", "confirmed", "cancelled", "pending"];
const payStatuses     = ["paid", "paid", "paid", "paid", "refunded", "unpaid"];

const bookingData = [];

// Each user books 2-4 events
for (const user of users) {
  const numBookings = rand(2, 4);
  const shuffled = [...events].sort(() => Math.random() - 0.5).slice(0, numBookings);

  for (const event of shuffled) {
    const seats = rand(1, 3);
    const statusIdx = rand(0, bookingStatuses.length - 1);
    bookingData.push({
      userId: user._id,
      eventId: event._id,
      seats,
      totalPrice: event.price * seats,
      status: bookingStatuses[statusIdx],
      paymentStatus: payStatuses[statusIdx],
      guestName: user.name,
      guestPhone: `+91 ${rand(7000000000, 9999999999)}`,
      notes: pick(["Window seat preferred", "Vegetarian meal", "Wheelchair access needed", "VIP section", ""]),
      createdAt: daysAgo(rand(1, 60)),
    });
  }
}

const bookings = await Booking.insertMany(bookingData);
console.log(`🎟️  Created: ${bookings.length} bookings`);

// ════════════════════════════════════════════════════════════
// 5. ORDERS
// ════════════════════════════════════════════════════════════
const orderStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Delivered", "Delivered", "Cancelled"];

const orderData = [];
for (const user of users) {
  const numOrders = rand(1, 3);
  for (let i = 0; i < numOrders; i++) {
    const numItems = rand(1, 4);
    const orderProducts = [];
    let total = 0;

    for (let j = 0; j < numItems; j++) {
      const p = pick(products);
      const qty = rand(1, 3);
      orderProducts.push({ productId: p._id, name: p.name, price: p.price, quantity: qty });
      total += p.price * qty;
    }

    orderData.push({
      userId: user._id,
      products: orderProducts,
      totalAmount: total,
      status: pick(orderStatuses),
      createdAt: daysAgo(rand(1, 90)),
    });
  }
}

const orders = await Order.insertMany(orderData);
console.log(`📋 Created: ${orders.length} orders`);

// ════════════════════════════════════════════════════════════
// 6. CARTS (for 3 users)
// ════════════════════════════════════════════════════════════
const cartData = users.slice(0, 3).map(user => ({
  userId: user._id,
  items: Array.from({ length: rand(1, 4) }, () => {
    const p = pick(products);
    return { productId: p._id, quantity: rand(1, 3), price: p.price };
  }),
}));

const carts = await Cart.insertMany(cartData);
console.log(`🛒 Created: ${carts.length} carts`);

// ════════════════════════════════════════════════════════════
// 7. MEMBERSHIPS
// ════════════════════════════════════════════════════════════
const membershipTypes = ["6months", "1year", "2years"];

const membershipData = vendors.map((vendor, i) => {
  const type = membershipTypes[i % membershipTypes.length];
  const start = daysAgo(rand(10, 60));
  const end = type === "6months"
    ? new Date(start.getTime() + 180 * 86400000)
    : type === "1year"
    ? new Date(start.getTime() + 365 * 86400000)
    : new Date(start.getTime() + 730 * 86400000);

  return { vendorId: vendor._id, type, startDate: start, endDate: end };
});

const memberships = await Membership.insertMany(membershipData);
console.log(`💳 Created: ${memberships.length} memberships`);

// ════════════════════════════════════════════════════════════
// 8. GUEST LISTS
// ════════════════════════════════════════════════════════════
const guestNames = [
  "Amit Kumar", "Priya Singh", "Ravi Verma", "Sunita Rao", "Deepak Jain",
  "Meera Nair", "Suresh Pillai", "Anita Desai", "Rajesh Khanna", "Neha Gupta",
  "Sanjay Patel", "Divya Sharma", "Arun Mishra", "Kavitha Reddy", "Mohan Das",
  "Lakshmi Iyer", "Vijay Malhotra", "Rekha Bose", "Ashok Tiwari", "Geeta Pandey",
];
const guestStatuses = ["invited", "confirmed", "confirmed", "attended", "cancelled"];

const guestData = [];
// Add guests to first 4 events
for (const event of events.slice(0, 4)) {
  const numGuests = rand(5, 10);
  for (let i = 0; i < numGuests; i++) {
    guestData.push({
      eventId:     event._id,
      addedBy:     event.vendorId,
      addedByRole: "vendor",
      name:   pick(guestNames),
      email:  `guest${rand(100, 999)}@email.com`,
      phone:  `+91 ${rand(7000000000, 9999999999)}`,
      status: pick(guestStatuses),
      notes:  pick(["VIP guest", "Speaker", "Sponsor", "Media", "Press", ""]),
    });
  }
}

const guests = await GuestList.insertMany(guestData);
console.log(`👥 Created: ${guests.length} guests`);

// ════════════════════════════════════════════════════════════
// SUMMARY
// ════════════════════════════════════════════════════════════
console.log("\n╔══════════════════════════════════════════════╗");
console.log("║         ✅ SEED COMPLETED SUCCESSFULLY        ║");
console.log("╠══════════════════════════════════════════════╣");
console.log(`║  👤 Admin    : 1                              ║`);
console.log(`║  🏪 Vendors  : ${vendors.length}                              ║`);
console.log(`║  👥 Users    : ${users.length}                              ║`);
console.log(`║  📦 Products : ${products.length}                             ║`);
console.log(`║  🎉 Events   : ${events.length}                             ║`);
console.log(`║  🎟️  Bookings : ${bookings.length}                             ║`);
console.log(`║  📋 Orders   : ${orders.length}                             ║`);
console.log(`║  🛒 Carts    : ${carts.length}                              ║`);
console.log(`║  💳 Members  : ${memberships.length}                              ║`);
console.log(`║  👥 Guests   : ${guests.length}                             ║`);
console.log("╠══════════════════════════════════════════════╣");
console.log("║  🔑 All passwords: password123               ║");
console.log("║  📧 admin@ems.com  → Admin                   ║");
console.log("║  📧 priya@vendor.com → Vendor                ║");
console.log("║  📧 arjun@user.com → User                    ║");
console.log("╚══════════════════════════════════════════════╝\n");

await mongoose.disconnect();
process.exit(0);
