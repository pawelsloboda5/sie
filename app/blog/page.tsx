import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock, ArrowRight, TrendingUp, User } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Healthcare Blog | Affordable Care Tips & Guides',
  description: 'Expert advice on finding affordable healthcare, understanding insurance alternatives, navigating free clinics, and saving money on medical costs. Updated weekly.',
  keywords: ['healthcare blog', 'affordable care tips', 'medical cost savings', 'free clinic guides', 'insurance alternatives'],
  openGraph: {
    title: 'SIE Wellness Blog - Affordable Healthcare Insights',
    description: 'Your trusted source for healthcare affordability tips and guides',
  }
}

// Blog posts data with SEO-rich content
const blogPosts = [
  {
    slug: 'how-to-find-free-clinics-complete-guide',
    title: 'How to Find Free Clinics Near You: Complete 2025 Guide',
    excerpt: 'Discover how to locate and qualify for free medical clinics in your area. Learn about FQHCs, community health centers, and what documents you need.',
    category: 'Free Clinics',
    author: 'Dr. Sarah Martinez',
    date: '2025-01-15',
    readTime: '8 min',
    featured: true,
    image: '/blog/free-clinics-guide.jpg',
    tags: ['free clinics', 'FQHCs', 'uninsured care']
  },
  {
    slug: 'save-money-prescription-drugs-2025',
    title: '10 Ways to Save 80% on Prescription Drugs Without Insurance',
    excerpt: 'From GoodRx to patient assistance programs, learn proven strategies to dramatically reduce your prescription costs.',
    category: 'Prescriptions',
    author: 'Michael Chen, PharmD',
    date: '2025-01-12',
    readTime: '6 min',
    featured: true,
    image: '/blog/prescription-savings.jpg',
    tags: ['prescriptions', 'drug savings', 'pharmacy']
  },
  {
    slug: 'sliding-scale-therapy-everything-you-need',
    title: 'Sliding Scale Therapy: How to Find Affordable Mental Health Care',
    excerpt: 'Mental health care doesn\'t have to break the bank. Learn about sliding scale fees, online therapy options, and community resources.',
    category: 'Mental Health',
    author: 'Lisa Thompson, LCSW',
    date: '2025-01-10',
    readTime: '7 min',
    featured: false,
    image: '/blog/mental-health-affordable.jpg',
    tags: ['mental health', 'therapy', 'sliding scale']
  },
  {
    slug: 'urgent-care-vs-emergency-room-save-thousands',
    title: 'Urgent Care vs. ER: How to Save $2,000 on Emergency Medical Care',
    excerpt: 'Know when to choose urgent care over the emergency room and save thousands. Plus, find the most affordable urgent care near you.',
    category: 'Emergency Care',
    author: 'Dr. James Wilson',
    date: '2025-01-08',
    readTime: '5 min',
    featured: false,
    image: '/blog/urgent-care-savings.jpg',
    tags: ['urgent care', 'emergency', 'cost comparison']
  },
  {
    slug: 'dental-care-without-insurance-complete-guide',
    title: 'Affordable Dental Care Without Insurance: Your Complete Guide',
    excerpt: 'From dental schools to discount plans, discover 7 ways to get quality dental care at a fraction of the cost.',
    category: 'Dental',
    author: 'Dr. Emily Rodriguez, DDS',
    date: '2025-01-05',
    readTime: '9 min',
    featured: false,
    image: '/blog/dental-affordable.jpg',
    tags: ['dental care', 'teeth cleaning', 'dental schools']
  },
  {
    slug: 'medicaid-eligibility-application-guide',
    title: 'Medicaid Eligibility 2025: Do You Qualify for Free Healthcare?',
    excerpt: 'Complete guide to Medicaid eligibility, application process, and covered services. Find out if you qualify in your state.',
    category: 'Insurance',
    author: 'Jennifer Park',
    date: '2025-01-03',
    readTime: '10 min',
    featured: false,
    image: '/blog/medicaid-guide.jpg',
    tags: ['medicaid', 'insurance', 'eligibility']
  }
]

const categories = [
  { name: 'All Posts', count: 47 },
  { name: 'Free Clinics', count: 12 },
  { name: 'Mental Health', count: 8 },
  { name: 'Dental Care', count: 6 },
  { name: 'Prescriptions', count: 9 },
  { name: 'Insurance', count: 7 },
  { name: 'Emergency Care', count: 5 }
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
              Healthcare Savings Blog
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Expert tips, guides, and strategies to help you navigate affordable healthcare and save thousands on medical costs
            </p>
          </div>
          
          {/* Subscribe CTA */}
          <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="font-semibold mb-3">Get Weekly Healthcare Savings Tips</h3>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Join 10,000+ readers. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-12 px-4">
        <div className="container max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {blogPosts.filter(post => post.featured).map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-t-lg">
                    {/* Image placeholder */}
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <TrendingUp className="w-12 h-12" />
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <span className="text-xs text-slate-500">Featured</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-12 px-4 bg-white dark:bg-slate-900">
        <div className="container max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Posts List */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
              <div className="space-y-6">
                {blogPosts.map(post => (
                  <Link key={post.slug} href={`/blog/${post.slug}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg md:col-span-1">
                            {/* Image placeholder */}
                          </div>
                          <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-emerald-600">
                                {post.category}
                              </span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-xs text-slate-500">{post.readTime}</span>
                            </div>
                            <h3 className="font-bold mb-2 line-clamp-2">{post.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3" />
                                {post.author}
                              </div>
                              <span>{post.date}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              
              {/* Pagination */}
              <div className="flex justify-center gap-2 mt-8">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm">1</Button>
                <Button size="sm" className="bg-emerald-600">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Categories */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <Link
                        key={cat.name}
                        href={`/blog/category/${cat.name.toLowerCase().replace(' ', '-')}`}
                        className="flex items-center justify-between p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="text-sm">{cat.name}</span>
                        <span className="text-xs text-slate-500">({cat.count})</span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Tags */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">Popular Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {['free clinics', 'medicaid', 'dental care', 'mental health', 
                      'prescriptions', 'urgent care', 'insurance', 'medicare',
                      'sliding scale', 'FQHCs'].map(tag => (
                      <Link
                        key={tag}
                        href={`/blog/tag/${tag.replace(' ', '-')}`}
                        className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* CTA Widget */}
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200">
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold mb-2">Need Help Finding Care?</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Our AI copilot can help you find affordable providers in seconds
                  </p>
                  <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/copilot">
                      Start Free Consultation
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
