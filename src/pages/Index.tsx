import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Clock, Users, Smartphone, ChevronRight, Zap, Heart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { CategoryGrid } from '@/components/CategoryGrid';
import { ProductCard } from '@/components/ProductCard';
import { mockProducts, useStore } from '@/lib/store';

const trustFeatures = [
  {
    icon: Shield,
    title: 'Student Profile',
    description: 'Campus and student details in one place',
  },
  {
    icon: Users,
    title: 'Parent Controlled',
    description: 'Daily & monthly spending limits',
  },
  {
    icon: Smartphone,
    title: 'Pickup Code Collection',
    description: 'A demo one-time code confirms collection',
  },
  {
    icon: Clock,
    title: 'Fixed Delivery Windows',
    description: 'Same-day delivery to your campus',
  },
];

const stats = [
  { value: 'Same Day', label: 'Campus delivery' },
  { value: 'Parent', label: 'Spending controls' },
  { value: 'Campus', label: 'Focused essentials' },
  { value: 'Pickup Code', label: 'Collection check' },
];

export default function Index() {
  const { selectedCampus, student, walletBalance } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const featuredProducts = mockProducts.slice(0, 8);

  const submitSearch = () => {
    const query = searchQuery.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Campus Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="verified" className="px-4 py-1.5 text-sm">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Your selected city: {selectedCampus}
              </Badge>
              <p className="mt-3 text-sm text-muted-foreground">Welcome, {student.fullName.split(' ')[0]} · Demo wallet {`₹${walletBalance.toLocaleString('en-IN')}`} · {student.institution}</p>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight"
            >
              Essentials Delivered
              <br />
              <span className="text-gradient">to Your Campus, Same Day</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Everyday essentials delivered to your campus on the same day.
              Shop fruits, snacks, and hygiene essentials with parent-controlled spending
              and pickup-code collection.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  variant="large"
                  placeholder="Search for fruits, snacks, essentials..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter') submitSearch(); }}
                  className="pl-12 pr-4"
                />
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link to="/products">
                <Button variant="hero" size="xl">
                  Start Ordering
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/parent">
                <Button variant="hero-secondary" size="xl">
                  <Shield className="w-5 h-5" />
                  Parent Portal
                </Button>
              </Link>
              <Link to="/demo"><Button variant="outline" size="xl">Explore all demo roles</Button></Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-6 md:gap-12 pt-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="font-display text-2xl md:text-3xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {trustFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center gap-3 p-4"
              >
                <div className="w-12 h-12 rounded-2xl gradient-trust flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-6"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Shop by Category
            </h2>
            <Link to="/products" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <CategoryGrid />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Popular Essentials
              </h2>
              <p className="text-muted-foreground mt-1">Sample picks from the campus essentials catalog</p>
            </div>
            <Link to="/products" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              How CampusKart Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A campus-first shopping journey with parent-aware spending and scheduled same-day windows.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Browse & Order',
                description: 'Select essentials from curated categories. Add to cart with one tap.',
                icon: Package,
              },
              {
                step: '02',
                title: 'Parent Approval',
                description: 'Orders within configured limits proceed. Requests beyond them wait for parent review.',
                icon: Shield,
              },
              {
                step: '03',
                title: 'Campus Collection',
                description: 'Collect at a campus point using the demo pickup code.',
                icon: Zap,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="elevated" className="p-6 h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-primary mb-2">STEP {item.step}</div>
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
              Ready to Order?
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              A campus-first essentials platform designed around student needs and parent peace of mind.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/products">
                <Button
                  size="xl"
                  className="bg-card text-foreground hover:bg-card/90 font-semibold shadow-xl"
                >
                  Start Ordering Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">C</span>
              </div>
              <span className="font-display font-bold text-lg">
                Campus<span className="text-primary">Kart</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
              <Link to="/orders" className="hover:text-foreground transition-colors">Orders</Link>
              <Link to="/parent" className="hover:text-foreground transition-colors">Parents</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 CampusKart. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
