import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin users
  const hashedPassword = await bcrypt.hash('Admin@123', 12)
  
  const admins = [
    { email: 'admin@doctorplanet.com', name: 'Admin' },
    { email: 'doctorplanet.dawood@gmail.com', name: 'Dawood Admin' },
    { email: 'doctorplanet.usama@gmail.com', name: 'Usama Admin' },
    { email: 'doctorplanet.huzaifa@gmail.com', name: 'Huzaifa Admin' },
  ]

  for (const adminData of admins) {
    const admin = await prisma.user.upsert({
      where: { email: adminData.email },
      update: { role: 'ADMIN' }, // Ensure they have ADMIN role
      create: {
        email: adminData.email,
        name: adminData.name,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    })
    console.log('Admin user created/updated:', admin.email)
  }

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'medical-clothes' },
      update: {},
      create: {
        name: 'Medical Clothes',
        slug: 'medical-clothes',
        description: 'Professional medical uniforms, scrubs, lab coats, and more',
        image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'medical-shoes' },
      update: {},
      create: {
        name: 'Medical Shoes',
        slug: 'medical-shoes',
        description: 'Comfortable and durable footwear for healthcare professionals',
        image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'medical-equipment' },
      update: {},
      create: {
        name: 'Medical Equipment',
        slug: 'medical-equipment',
        description: 'Essential medical tools and equipment for professionals',
        image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800',
      },
    }),
  ])

  console.log('Categories created:', categories.map(c => c.name))

  // Create sample products
  const products = [
    // Medical Clothes
    {
      name: 'Premium Scrub Set',
      slug: 'premium-scrub-set',
      description: 'High-quality medical scrub set made from breathable, antimicrobial fabric. Features multiple pockets, comfortable fit, and professional appearance. Perfect for long shifts.',
      price: 89.99,
      salePrice: 74.99,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800',
        'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800'
      ]),
      categoryId: categories[0].id,
      stock: 50,
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Navy Blue', 'Ceil Blue', 'Black', 'Maroon', 'White']),
      featured: true,
    },
    {
      name: 'Lab Coat - Professional',
      slug: 'lab-coat-professional',
      description: 'Classic white lab coat with a modern fit. Features side pockets, chest pocket, and durable buttons. Made from wrinkle-resistant fabric.',
      price: 69.99,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800'
      ]),
      categoryId: categories[0].id,
      stock: 35,
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['White']),
      featured: true,
    },
    {
      name: 'Surgical Cap - Pack of 5',
      slug: 'surgical-cap-pack',
      description: 'Disposable surgical caps in assorted colors. Elastic band for secure fit. Breathable material keeps you cool during procedures.',
      price: 24.99,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800'
      ]),
      categoryId: categories[0].id,
      stock: 100,
      sizes: JSON.stringify(['One Size']),
      colors: JSON.stringify(['Blue', 'Green', 'Pink', 'Black']),
      featured: false,
    },
    // Medical Shoes
    {
      name: 'Comfort Nursing Clogs',
      slug: 'comfort-nursing-clogs',
      description: 'Ergonomically designed clogs with superior arch support. Slip-resistant sole, easy to clean, and perfect for 12+ hour shifts. Lightweight EVA construction.',
      price: 79.99,
      salePrice: 64.99,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800'
      ]),
      categoryId: categories[1].id,
      stock: 40,
      sizes: JSON.stringify(['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']),
      colors: JSON.stringify(['White', 'Black', 'Navy', 'Pink']),
      featured: true,
    },
    {
      name: 'Professional Medical Sneakers',
      slug: 'professional-medical-sneakers',
      description: 'Athletic-style sneakers designed for healthcare workers. Features memory foam insoles, breathable mesh upper, and non-marking rubber sole.',
      price: 119.99,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'
      ]),
      categoryId: categories[1].id,
      stock: 30,
      sizes: JSON.stringify(['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']),
      colors: JSON.stringify(['White', 'Black', 'Grey']),
      featured: false,
    },
    {
      name: 'Surgical Operating Shoes',
      slug: 'surgical-operating-shoes',
      description: 'Specialized footwear for operating room use. Fully enclosed, fluid-resistant, and autoclavable. Features adjustable heel strap.',
      price: 54.99,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800'
      ]),
      categoryId: categories[1].id,
      stock: 45,
      sizes: JSON.stringify(['36', '37', '38', '39', '40', '41', '42', '43', '44']),
      colors: JSON.stringify(['White', 'Blue', 'Green']),
      featured: false,
    },
    // Medical Equipment
    {
      name: 'Professional Stethoscope',
      slug: 'professional-stethoscope',
      description: 'High-quality dual-head stethoscope with excellent acoustic performance. Features comfortable ear tips, flexible tubing, and stainless steel chestpiece.',
      price: 149.99,
      salePrice: 129.99,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=800'
      ]),
      categoryId: categories[2].id,
      stock: 25,
      sizes: JSON.stringify([]),
      colors: JSON.stringify(['Black', 'Navy', 'Burgundy', 'Hunter Green']),
      featured: true,
    },
    {
      name: 'Digital Blood Pressure Monitor',
      slug: 'digital-blood-pressure-monitor',
      description: 'Accurate automatic blood pressure monitor with large LCD display. Features irregular heartbeat detection, memory storage for 2 users, and easy one-touch operation.',
      price: 89.99,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800'
      ]),
      categoryId: categories[2].id,
      stock: 20,
      sizes: JSON.stringify([]),
      colors: JSON.stringify(['White']),
      featured: true,
    },
    {
      name: 'Medical Penlight - LED',
      slug: 'medical-penlight-led',
      description: 'Professional LED penlight for pupil examination. Features bright focused beam, pocket clip, and push-button operation. Includes 2 AAA batteries.',
      price: 14.99,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1576671081837-49000212a370?w=800'
      ]),
      categoryId: categories[2].id,
      stock: 80,
      sizes: JSON.stringify([]),
      colors: JSON.stringify(['Black', 'Silver', 'Blue']),
      featured: false,
    },
    {
      name: 'First Aid Kit - Professional',
      slug: 'first-aid-kit-professional',
      description: 'Comprehensive first aid kit with 200+ pieces. Includes bandages, antiseptic wipes, scissors, tweezers, and emergency supplies in a durable case.',
      price: 59.99,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800'
      ]),
      categoryId: categories[2].id,
      stock: 15,
      sizes: JSON.stringify([]),
      colors: JSON.stringify(['Red']),
      featured: false,
    },
    {
      name: 'Pulse Oximeter',
      slug: 'pulse-oximeter',
      description: 'Fingertip pulse oximeter for measuring blood oxygen saturation and pulse rate. Features OLED display, auto power-off, and lanyard included.',
      price: 34.99,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800'
      ]),
      categoryId: categories[2].id,
      stock: 60,
      sizes: JSON.stringify([]),
      colors: JSON.stringify(['Blue', 'Black', 'Pink']),
      featured: false,
    },
    {
      name: 'Infrared Thermometer',
      slug: 'infrared-thermometer',
      description: 'Non-contact infrared thermometer for quick and accurate temperature readings. Features fever alarm, memory recall, and instant results in 1 second.',
      price: 44.99,
      salePrice: 39.99,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=800'
      ]),
      categoryId: categories[2].id,
      stock: 40,
      sizes: JSON.stringify([]),
      colors: JSON.stringify(['White']),
      featured: true,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    })
  }

  console.log('Products created:', products.length)

  // Create sample testimonials
  const testimonials = [
    {
      name: 'Dr. Sarah Mitchell',
      role: 'Emergency Medicine Physician',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200',
      content: 'Doctor Planet has been my go-to for medical apparel. The scrubs are incredibly comfortable for 12-hour shifts, and the quality is unmatched. Highly recommend!',
      rating: 5,
      order: 1,
    },
    {
      name: 'Nurse James Chen',
      role: 'ICU Nurse',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200',
      content: "Finally found shoes that don't hurt my feet after long shifts! The nursing clogs from Doctor Planet are a game-changer. Plus, the delivery was super fast.",
      rating: 5,
      order: 2,
    },
    {
      name: 'Dr. Maria Rodriguez',
      role: 'Pediatrician',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200',
      content: 'The stethoscope I purchased has excellent acoustic quality. My patients love the colorful scrubs too - makes the clinic less intimidating for kids!',
      rating: 5,
      order: 3,
    },
    {
      name: 'Pharmacist David Kim',
      role: 'Clinical Pharmacist',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200',
      content: 'Great selection of lab coats and professional attire. The customer service team was incredibly helpful when I needed to exchange sizes. Will definitely order again.',
      rating: 4,
      order: 4,
    },
  ]

  for (const testimonial of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: `seed-${testimonial.order}` },
      update: testimonial,
      create: {
        id: `seed-${testimonial.order}`,
        ...testimonial,
      },
    })
  }

  console.log('Testimonials created:', testimonials.length)

  // Create team members
  const teamMembers = [
    {
      name: 'Huzaifa Shah',
      role: 'Founder & Software Engineer',
      bio: 'The visionary behind Doctor Planet. Huzaifa combines his passion for technology with a deep understanding of healthcare needs. As the founder, he architected the entire platform and continues to drive innovation, ensuring Doctor Planet delivers the best experience for healthcare professionals across Pakistan.',
      isFounder: true,
      order: 1,
    },
    {
      name: 'Syed Measam Raza',
      role: 'Designer & Quality Checker',
      bio: 'With an eye for detail and commitment to excellence, Measam ensures every product meets our high standards. He oversees the design aesthetics and quality control process, making sure healthcare professionals receive only the finest medical apparel that combines style with functionality.',
      isFounder: true,
      order: 2,
    },
    {
      name: 'Muhammad Usama Ali',
      role: 'Operations Lead & Product Sourcer',
      bio: 'The backbone of Doctor Planet operations. Usama is instrumental in sourcing premium products from trusted manufacturers worldwide. His extensive network and keen eye for quality ensure we always have the best medical apparel and equipment for our customers. He keeps everything running smoothly.',
      isFounder: true,
      order: 3,
    },
  ]

  for (const member of teamMembers) {
    await prisma.teamMember.upsert({
      where: { id: `team-${member.order}` },
      update: member,
      create: {
        id: `team-${member.order}`,
        ...member,
      },
    })
  }

  console.log('Team members created:', teamMembers.length)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
