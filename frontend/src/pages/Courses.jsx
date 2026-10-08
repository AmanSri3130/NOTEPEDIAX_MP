import { useState, useEffect } from 'react';
import { 
  Search, Star, PlayCircle, SlidersHorizontal,
  ArrowUpDown, Check, Globe, User, BookMarked, ShoppingCart
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import useCart from '../hooks/useCart';
import toast from 'react-hot-toast';

export default function Courses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'price-low' | 'price-high' | 'rating'
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [courseList, setCourseList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const handleAddToCartClick = async (courseId) => {
    if (!user) {
      toast.error('Please log in to add items to your cart');
      navigate('/login');
      return;
    }
    try {
      await addToCart(courseId, 'course').unwrap();
    } catch {
      // already handled
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'All') {
          params.append('category', selectedCategory);
        }
        if (selectedRating && selectedRating !== 'All') {
          params.append('rating', selectedRating);
        }
        if (selectedLanguage && selectedLanguage !== 'All') {
          params.append('language', selectedLanguage);
        }
        if (search) {
          params.append('search', search);
        }
        params.append('sortBy', sortBy);

        const res = await api.get(`/courses?${params.toString()}`);
        if (res.data.success) {
          setCourseList(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [selectedCategory, selectedRating, selectedLanguage, search, sortBy]);

  const sortedCourses = courseList;

  const categories = ['All', 'JEE', 'NEET', 'Coding', 'Boards', 'UPSC'];
  const ratings = ['All', '4.8+', '4.6+'];
  const languages = ['All', 'Hinglish', 'Hindi', 'English'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-brand-base min-h-screen text-brand-text transition-colors duration-300">
      
      {/* Header section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-[10px] font-mono text-brand-primary bg-brand-primary-light dark:bg-brand-primary/10 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
          ACADEMIC MASTERCLASSES
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-brand-text mt-3">
          Explore Online{' '}
          <span className="bg-gradient-to-r from-brand-primary via-brand-orange to-brand-primary bg-clip-text text-transparent">
            Courses
          </span>
        </h1>
        <p className="text-brand-muted text-xs sm:text-sm mt-3 max-w-xl mx-auto leading-relaxed">
          Unlock video chapters mapped to latest exam patterns, supported by our step-by-step Doubt Solving AI assistant.
        </p>
      </div>

      {/* Main search and filter bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 border-b border-brand-border pb-6">
        
        {/* Expanded search */}
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-brand-muted">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search lectures, syllabus tags or educators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-brand-border bg-brand-card py-3 pl-10 pr-4 text-xs outline-none focus:border-brand-primary text-brand-text placeholder:text-brand-muted shadow-sm transition-all"
          />
        </div>

        {/* Sort and mobile filter toggle row */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3 shrink-0">
          
          {/* Sorting dropdown */}
          <div className="flex items-center gap-1.5 bg-brand-card border border-brand-border px-3 py-2 rounded-xl shadow-sm text-xs font-semibold text-brand-muted">
            <ArrowUpDown className="h-4 w-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none outline-none text-brand-text cursor-pointer text-xs font-semibold"
            >
              <option value="popular">Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {/* Mobile filter button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex md:hidden items-center gap-1.5 bg-brand-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

      </div>

      {/* Grid container: Left Sidebar & Right Products grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Desktop Left Filters Sidebar */}
        <div className="hidden md:block lg:col-span-3 space-y-6">
          
          <GlassCard className="p-5 space-y-6 bg-brand-card">
            
            {/* Category Filter */}
            <div>
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-brand-text mb-3 border-b border-brand-border pb-2">
                Exam Category
              </h3>
              <div className="flex flex-col gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left rounded-xl px-3 py-2 text-xs font-semibold border transition-all flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'border-brand-primary bg-brand-primary-light dark:bg-brand-primary/10 text-brand-primary'
                        : 'border-transparent text-brand-muted hover:bg-brand-base'
                    }`}
                  >
                    <span>{cat} Masterclass</span>
                    {selectedCategory === cat && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating filter */}
            <div>
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-brand-text mb-3 border-b border-brand-border pb-2">
                Minimum Rating
              </h3>
              <div className="flex flex-col gap-1.5">
                {ratings.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setSelectedRating(rate)}
                    className={`w-full text-left rounded-xl px-3 py-2 text-xs font-semibold border transition-all flex items-center justify-between ${
                      selectedRating === rate
                        ? 'border-brand-primary bg-brand-primary-light dark:bg-brand-primary/10 text-brand-primary'
                        : 'border-transparent text-brand-muted hover:bg-brand-base'
                    }`}
                  >
                    <span>{rate === 'All' ? 'All Ratings' : `${rate} Stars`}</span>
                    {selectedRating === rate && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Language filter */}
            <div>
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-brand-text mb-3 border-b border-brand-border pb-2">
                Lecture Language
              </h3>
              <div className="flex flex-col gap-1.5">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`w-full text-left rounded-xl px-3 py-2 text-xs font-semibold border transition-all flex items-center justify-between ${
                      selectedLanguage === lang
                        ? 'border-brand-primary bg-brand-primary-light dark:bg-brand-primary/10 text-brand-primary'
                        : 'border-transparent text-brand-muted hover:bg-brand-base'
                    }`}
                  >
                    <span>{lang === 'All' ? 'All Languages' : lang}</span>
                    {selectedLanguage === lang && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>

          </GlassCard>

        </div>

        {/* Right Columns: Courses Listings */}
        <div className="col-span-1 lg:col-span-9">
          {isLoading ? (
            <p className="text-center py-16 text-xs text-brand-muted">Loading course catalog...</p>
          ) : sortedCourses.length === 0 ? (
            <div className="text-center py-16 border border-brand-border rounded-2xl bg-brand-card">
              <BookMarked className="h-10 w-10 text-brand-dim mx-auto" />
              <h3 className="font-display text-sm font-bold text-brand-text mt-3">No Courses Found</h3>
              <p className="text-xs text-brand-muted mt-1">Try relaxing your category or tag query filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCourses.map((course) => (
                <GlassCard 
                  key={course._id} 
                  className="flex flex-col justify-between h-full relative overflow-hidden group hover:border-brand-primary/30 transition-all duration-300 bg-brand-card shadow-sm hover:shadow-md"
                >
                  
                  {/* Thumbnail Cover */}
                  <div className="h-44 rounded-2xl bg-gradient-to-tr from-brand-primary/10 to-brand-orange/10 border border-brand-border relative overflow-hidden flex items-center justify-center">
                    
                    {/* Course Initials Badge */}
                    <div className="h-16 w-16 rounded-full bg-brand-card border border-brand-border flex items-center justify-center font-display text-xl font-extrabold text-brand-primary group-hover:scale-105 transition-transform duration-300">
                      {course.imageInitials}
                    </div>

                    <PlayCircle className="absolute h-9 w-9 text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                    <span className="absolute top-3 left-3 bg-brand-base/90 text-[9px] font-mono text-brand-primary px-2.5 py-1 rounded-full border border-brand-border font-bold">
                      {course.category}
                    </span>
                    {course.isDemo && (
                      <span className="absolute bottom-3 left-3 bg-amber-100 text-amber-900 text-[9px] font-mono px-2.5 py-1 rounded-full border border-amber-300 font-bold">
                        DEMO CONTENT
                      </span>
                    )}

                    <span className="absolute top-3 right-3 bg-brand-base/90 text-[9px] font-mono text-brand-orange px-2.5 py-1 rounded-full border border-brand-border font-bold flex items-center gap-0.5">
                      <Globe className="h-2.5 w-2.5" />
                      {course.language}
                    </span>

                  </div>

                  {/* Body details */}
                  <div className="space-y-2.5 mt-4 flex-grow">
                    <h3 className="font-display text-sm sm:text-base font-bold text-brand-text group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">
                      {course.title}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-xs text-brand-muted">
                      <User className="h-3.5 w-3.5 text-brand-primary" />
                      <span>{course.instructor?.name || course.instructor || 'Instructor not listed'}</span>
                    </div>

                    {/* Ratings */}
                    <div className="flex items-center gap-1 text-xs text-brand-muted font-mono">
                      {(course.rating?.count || 0) > 0 && <Star className="h-3.5 w-3.5 fill-current text-brand-yellow" />}
                      <span className="font-bold text-brand-text">
                        {(course.rating?.count || 0) > 0 ? course.rating.average : 'Not rated'}
                      </span>
                      <span>({course.enrolledCount || 0} students)</span>
                    </div>
                  </div>

                  {/* Pricing and Action buy links */}
                  <div className="mt-6 pt-4 border-t border-brand-border flex items-center justify-between shrink-0">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-brand-dim uppercase font-semibold">
                        {course.isDemo ? 'DEMO • FREE' : 'TRIAL PRICE'}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-base font-extrabold text-brand-text">₹{course.price}</span>
                        <span className="text-[10px] text-brand-muted line-through">₹{course.mrp}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {course.price > 0 && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCartClick(course._id);
                          }}
                          className="p-2.5 rounded-xl bg-brand-orange/10 hover:bg-brand-orange text-brand-orange hover:text-white transition-all shadow-sm border border-brand-orange/20 active:scale-95 flex items-center justify-center shrink-0"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      )}
                      <Link
                        to={`/courses/${course.slug}`}
                        className="rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white px-4 py-2.5 text-xs font-bold transition-all shadow-sm flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        Explore Details
                      </Link>
                    </div>
                  </div>

                </GlassCard>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Mobile drawer overlays for filters */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-80 bg-brand-card p-6 h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-brand-border pb-3">
                <span className="font-display text-sm font-bold text-brand-text flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter Courses
                </span>
                <button 
                  onClick={() => setMobileFiltersOpen(false)}
                  className="text-xs font-mono font-bold bg-brand-base border border-brand-border px-2.5 py-1 rounded"
                >
                  Close
                </button>
              </div>

              {/* Mobile Category */}
              <div>
                <h4 className="font-mono text-[10px] font-bold text-brand-dim uppercase tracking-wider mb-2">Category</h4>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-[10px] font-bold border rounded-lg px-2.5 py-1.5 transition-all ${
                        selectedCategory === cat 
                          ? 'border-brand-primary bg-brand-primary-light text-brand-primary' 
                          : 'border-brand-border bg-brand-base text-brand-muted'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Rating */}
              <div>
                <h4 className="font-mono text-[10px] font-bold text-brand-dim uppercase tracking-wider mb-2">Minimum Rating</h4>
                <div className="flex flex-wrap gap-1.5">
                  {ratings.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setSelectedRating(rate)}
                      className={`text-[10px] font-bold border rounded-lg px-2.5 py-1.5 transition-all ${
                        selectedRating === rate 
                          ? 'border-brand-primary bg-brand-primary-light text-brand-primary' 
                          : 'border-brand-border bg-brand-base text-brand-muted'
                      }`}
                    >
                      {rate === 'All' ? 'All Ratings' : `${rate} Stars`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Language */}
              <div>
                <h4 className="font-mono text-[10px] font-bold text-brand-dim uppercase tracking-wider mb-2">Lecture Language</h4>
                <div className="flex flex-wrap gap-1.5">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`text-[10px] font-bold border rounded-lg px-2.5 py-1.5 transition-all ${
                        selectedLanguage === lang 
                          ? 'border-brand-primary bg-brand-primary-light text-brand-primary' 
                          : 'border-brand-border bg-brand-base text-brand-muted'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold py-2.5 rounded-xl mt-8 shadow"
            >
              Apply Applied Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
