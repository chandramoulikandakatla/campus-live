import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { categories } from '@/lib/store';

export function CategoryGrid() {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-3 pb-2 min-w-max">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-md transition-all duration-200 min-w-[100px] group"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${category.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200`}
              >
                {category.icon}
              </div>
              <span className="text-xs font-medium text-foreground text-center whitespace-nowrap">
                {category.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function CategoryBar() {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-2 pb-2 min-w-max">
        <Link
          to="/products"
          className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium whitespace-nowrap"
        >
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?category=${encodeURIComponent(category.name)}`}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:border-primary/30 hover:bg-muted text-sm font-medium whitespace-nowrap transition-all"
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
