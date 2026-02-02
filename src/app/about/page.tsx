'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Shield, Truck, Award, Users, Target, Linkedin, Instagram, Facebook, Mail, Phone, User } from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  image: string | null
  isFounder: boolean
  email: string | null
  phone: string | null
  linkedin: string | null
  instagram: string | null
  facebook: string | null
}

const values = [
  {
    icon: Heart,
    title: 'Quality First',
    description: 'We source only the finest materials to ensure comfort during long shifts.',
  },
  {
    icon: Shield,
    title: 'Healthcare Focused',
    description: 'Designed by healthcare professionals, for healthcare professionals.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Quick and reliable delivery across Pakistan with order tracking.',
  },
  {
    icon: Award,
    title: 'Premium Standards',
    description: 'All products meet international quality and safety standards.',
  },
]

const stats = [
  { number: '10,000+', label: 'Happy Customers' },
  { number: '500+', label: 'Products' },
  { number: '50+', label: 'Cities Served' },
  { number: '4.9/5', label: 'Customer Rating' },
]

export default function AboutPage() {
  const [team, setTeam] = useState<TeamMember[]>([])

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch('/api/team')
        if (res.ok) {
          const data = await res.json()
          setTeam(data)
        }
      } catch (error) {
        console.error('Failed to fetch team:', error)
      }
    }
    fetchTeam()
  }, [])

  return (
    <div className="min-h-screen pt-0 sm:pt-20 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-secondary-900 mb-6">
                Empowering Healthcare Heroes with Premium Apparel
              </h1>
              <p className="text-lg text-secondary-600 mb-8">
                Doctor Planet was founded with a simple mission: to provide healthcare professionals 
                with high-quality, comfortable, and stylish medical apparel that helps them look 
                and feel their best while caring for others.
              </p>
              <Link
                href="/products"
                className="btn-primary inline-block"
              >
                Explore Our Collection
              </Link>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800"
                alt="Medical professionals"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-heading font-bold text-secondary-900 mb-6">Our Story</h2>
              <p className="text-lg text-secondary-600 mb-6">
                Founded in 2020, Doctor Planet emerged from a genuine understanding of healthcare 
                professionals' needs. Our founder, inspired by family members in the medical field, 
                recognized the gap between available medical apparel and what healthcare workers truly deserved.
              </p>
              <p className="text-lg text-secondary-600 mb-6">
                We started with a small collection of premium scrubs and have since grown to offer 
                a comprehensive range of medical clothing, footwear, and equipment. Every product 
                in our catalog is carefully selected to meet the demanding requirements of healthcare settings.
              </p>
              <p className="text-lg text-secondary-600">
                Today, we proudly serve thousands of healthcare professionals across Pakistan, 
                from busy emergency rooms to private clinics, helping them deliver exceptional care 
                in comfort and style.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      {team.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-secondary-900 to-secondary-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary-400 font-medium text-sm uppercase tracking-wider">
                The People Behind Doctor Planet
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mt-2 mb-4">
                Meet Our Team
              </h2>
              <p className="text-secondary-400 max-w-2xl mx-auto">
                Passionate individuals dedicated to revolutionizing medical apparel in Pakistan
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-primary-500/50 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-72 overflow-hidden">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                        <User className="w-24 h-24 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary-950 via-transparent to-transparent" />
                    
                    {/* Founder Badge */}
                    {member.isFounder && (
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-yellow-500 text-secondary-900 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg">
                        <Award className="w-3.5 h-3.5" />
                        Founder
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-primary-400 font-medium text-sm mb-3">{member.role}</p>
                    <p className="text-secondary-400 text-sm leading-relaxed">{member.bio}</p>

                    {/* Social Links */}
                    <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="p-2 bg-white/5 hover:bg-primary-600 text-secondary-400 hover:text-white rounded-lg transition-all duration-200"
                          title="Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          className="p-2 bg-white/5 hover:bg-green-600 text-secondary-400 hover:text-white rounded-lg transition-all duration-200"
                          title="Call"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white/5 hover:bg-blue-600 text-secondary-400 hover:text-white rounded-lg transition-all duration-200"
                          title="LinkedIn"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {member.instagram && (
                        <a
                          href={member.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white/5 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 text-secondary-400 hover:text-white rounded-lg transition-all duration-200"
                          title="Instagram"
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                      {member.facebook && (
                        <a
                          href={member.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white/5 hover:bg-blue-700 text-secondary-400 hover:text-white rounded-lg transition-all duration-200"
                          title="Facebook"
                        >
                          <Facebook className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-primary-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-heading font-bold text-secondary-900 mb-4">Our Values</h2>
            <p className="text-secondary-600 max-w-2xl mx-auto">
              These core principles guide everything we do at Doctor Planet
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">{value.title}</h3>
                <p className="text-secondary-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary-600 to-primary-700 p-10 rounded-2xl text-white"
            >
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-primary-100 text-lg">
                To provide healthcare professionals with premium quality medical apparel and 
                equipment that combines comfort, durability, and style, enabling them to 
                perform at their best while caring for others.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-secondary-800 to-secondary-900 p-10 rounded-2xl text-white"
            >
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-secondary-300 text-lg">
                To become Pakistan's most trusted destination for medical apparel, recognized 
                for our commitment to quality, customer satisfaction, and supporting the 
                healthcare community.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-heading font-bold text-white mb-6">
              Join Thousands of Healthcare Professionals
            </h2>
            <p className="text-secondary-400 text-lg mb-8">
              Experience the Doctor Planet difference. Shop our collection today.
            </p>
            <Link href="/products" className="btn-primary">
              Shop Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
