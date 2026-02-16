import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, ChefHat, Clock, MapPin } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex h-[600px] items-center justify-center overflow-hidden">
        {/* Unsplash image: Dark restaurant interior */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80" 
            alt="Restaurant Interior"
            className="h-full w-full object-cover brightness-50"
          />
        </div>
        
        <div className="relative z-10 container text-center text-white">
          <h1 className="mb-6 font-display text-5xl font-bold leading-tight md:text-7xl">
            Taste the Extraordinary
          </h1>
          <p className="mb-8 mx-auto max-w-2xl text-lg md:text-xl text-white/90">
            Experience modern culinary excellence in the heart of the city. 
            Fresh ingredients, innovative recipes, and an unforgettable atmosphere.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/menu">
              <Button size="lg" className="h-14 px-8 text-lg">
                View Menu <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ChefHat className="h-8 w-8" />
              </div>
              <h3 className="mb-4 text-xl font-bold">Master Chefs</h3>
              <p className="text-muted-foreground">
                Our culinary team brings years of experience from top Michelin-starred restaurants.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="mb-4 text-xl font-bold">Fresh Daily</h3>
              <p className="text-muted-foreground">
                We source our ingredients locally every morning to ensure peak freshness and quality.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="mb-4 text-xl font-bold">Prime Location</h3>
              <p className="text-muted-foreground">
                Located in the vibrant downtown district, perfect for business lunches or romantic dinners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dish Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="flex flex-col items-center gap-12 lg:flex-row">
            <div className="flex-1 space-y-6">
              <span className="text-sm font-bold uppercase tracking-wider text-primary">Signature Dish</span>
              <h2 className="font-display text-4xl font-bold md:text-5xl">The Royal Truffle Burger</h2>
              <p className="text-lg text-muted-foreground">
                A masterpiece of flavor featuring Wagyu beef, black truffle aioli, caramelized onions, 
                and aged cheddar on a brioche bun. Served with our famous rosemary fries.
              </p>
              <Link href="/menu">
                <Button variant="outline" size="lg">Order Now</Button>
              </Link>
            </div>
            <div className="flex-1">
              {/* Unsplash image: Gourmet burger */}
              <img 
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" 
                alt="Signature Burger" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-foreground py-12 text-white">
        <div className="container text-center">
          <h2 className="mb-6 font-display text-3xl font-bold">Gourmet Bistro</h2>
          <p className="mb-8 text-white/60">123 Culinary Avenue, Food District, NY 10012</p>
          <div className="text-sm text-white/40">
            © 2024 Gourmet Bistro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
