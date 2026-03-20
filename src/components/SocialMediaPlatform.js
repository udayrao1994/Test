import React, { useState, useMemo, useEffect } from 'react';
import { Flame, Search, User, MessageSquare, Heart, Share2, TrendingUp, Bell } from 'lucide-react';

// --- MOCK DATA ---
const INITIAL_DATA = {
  categories: ["Tech", "Gaming", "Lifestyle", "Finance", "Travel"],
  posts: [
    { id: 1, author: "AliceTech", category: "Tech", content: "AI is changing the world as we know it! #future #ai", likes: 1200, comments: 45, isHot: true, timestamp: "2h ago" },
    { id: 2, author: "GamerPro", category: "Gaming", content: "Finally beat the final boss in Elden Ring. My hands are shaking.", likes: 3500, comments: 210, isHot: true, timestamp: "5h ago" },
    { id: 3, author: "TravelBug", category: "Travel", content: "Sunsets in Santorini are unmatched. Look at this view!", likes: 800, comments: 12, isHot: false, timestamp: "1d ago" },
    { id: 4, author: "FinanceWiz", category: "Finance", content: "Market update: Why diversity in your portfolio matters today.", likes: 2100, comments: 89, isHot: true, timestamp: "1h ago" },
    { id: 5, author: "LifestyleGuru", category: "Lifestyle", content: "Morning routine for a productive day: 1. Meditate 2. Hydrate.", likes: 450, comments: 5, isHot: false, timestamp: "3h ago" },
    { id: 6, author: "CodeMaster", category: "Tech", content: "React 19 is going to be a game changer for server components.", likes: 1500, comments: 67, isHot: true, timestamp: "10m ago" },
    { id: 7, author: "PixelHunter", category: "Gaming", content: "New GPU benchmarks are in. Is it worth the upgrade?", likes: 900, comments: 34, isHot: true, timestamp: "4h ago" },
    { id: 8, author: "LevelUp", category: "Gaming", content: "Top 5 indie games you missed this year.", likes: 1300, comments: 41, isHot: true, timestamp: "12h ago" },
    { id: 9, author: "BullishBob", category: "Finance", content: "Bitcoin hitting new highs again. To the moon? 🚀", likes: 5000, comments: 400, isHot: true, timestamp: "30m ago" },
    { id: 10, author: "HealthyLiving", category: "Lifestyle", content: "Replacing sugar with honey changed my energy levels.", likes: 300, comments: 15, isHot: false, timestamp: "8h ago" },
    { id: 11, author: "DevGuru", category: "Tech", content: "The roadmap to becoming a Senior Engineer in 2024.", likes: 2200, comments: 88, isHot: true, timestamp: "5h ago" },
    { id: 12, author: "CloudNative", category: "Tech", content: "Kubernetes vs Docker Swarm: Let's settle this once and for all.", likes: 1100, comments: 120, isHot: true, timestamp: "1h ago" }
  ]
};

const PostCard = ({ post }) => (
  <div style={{
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '20px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  }}>
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
            <User size={20} />
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '14px' }}>@{post.author}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{post.timestamp} • <span style={{ color: '#6366f1' }}>{post.category}</span></div>
          </div>
        </div>
        {post.isHot && (
          <div style={{
            backgroundColor: '#ffedd5',
            color: '#ea580c',
            fontSize: '10px',
            fontWeight: '700',
            padding: '4px 8px',
            borderRadius: '999px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            height: 'fit-content'
          }}>
            <Flame size={12} fill="currentColor" /> Hot
          </div>
        )}
      </div>
      
      <p style={{ color: '#334155', lineHeight: '1.5', marginBottom: '20px', fontSize: '15px' }}>
        {post.content}
      </p>
    </div>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #f8fafc' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '13px' }}>
          <Heart size={18} /> {post.likes}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '13px' }}>
          <MessageSquare size={18} /> {post.comments}
        </div>
      </div>
      <Share2 size={18} color="#94a3b8" />
    </div>
  </div>
);

export default function SocialMediaPlatform() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showHotOnly, setShowHotOnly] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Responsive breakpoints
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredPosts = useMemo(() => {
    return INITIAL_DATA.posts.filter(post => {
      const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            post.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
      const isHotTopic = post.isHot;

      if (searchQuery === '' && activeCategory === 'All' && showHotOnly) {
        return isHotTopic;
      }
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, showHotOnly]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (val !== '') {
        setShowHotOnly(false);
    } else if (activeCategory === 'All') {
        setShowHotOnly(true);
    }
  };

  // Dynamic Styles
  const navInnerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    height: isMobile ? '70px' : '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: isMobile ? '8px' : '16px',
    padding: isMobile ? '0 12px' : '0 20px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: isMobile ? '16px' : '24px'
  };

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      color: '#1e293b'
    }}>
      {/* Navigation */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div style={navInnerStyle}>
          {/* Logo - Hide text on very small screens */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => {setShowHotOnly(true); setActiveCategory('All'); setSearchQuery('');}}>
            <div style={{ backgroundColor: '#4f46e5', padding: '8px', borderRadius: '12px', color: 'white', display: 'flex' }}>
              <TrendingUp size={isMobile ? 20 : 24} />
            </div>
            {!isMobile && <span style={{ fontWeight: '900', fontSize: '22px', fontStyle: 'italic', color: '#0f172a' }}>PULSE</span>}
          </div>
          
          {/* Search Bar */}
          <div style={{
             flexGrow: 1,
             maxWidth: isMobile ? 'none' : '500px',
             position: 'relative',
          }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input 
              type="text" 
              placeholder={isMobile ? "Search..." : "Search trending topics..."}
              style={{
                width: '100%',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 12px 10px 38px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* User Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
            <Bell size={20} color="#64748b" style={{ display: isMobile ? 'none' : 'block' }} />
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} />
            </div>
          </div>
        </div>
      </nav>

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '20px 16px' : '32px 20px'
      }}>
        
        {/* Category & Filter Bar */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '32px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '20px'
        }}>
          {/* Categories Scroller */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            overflowX: 'auto', 
            width: isMobile ? '100%' : 'auto',
            paddingBottom: isMobile ? '8px' : '0',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}>
            <button 
              onClick={() => {setActiveCategory('All'); if(searchQuery === '') setShowHotOnly(true);}}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: activeCategory === 'All' ? '#4f46e5' : '#ffffff',
                color: activeCategory === 'All' ? '#ffffff' : '#64748b',
                boxShadow: activeCategory === 'All' ? '0 4px 6px -1px rgba(79, 70, 229, 0.2)' : 'none'
              }}
            >
              All
            </button>
            {INITIAL_DATA.categories.map(cat => (
              <button 
                key={cat}
                onClick={() => {setActiveCategory(cat); setShowHotOnly(false);}}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeCategory === cat ? '#4f46e5' : '#ffffff',
                  color: activeCategory === cat ? '#ffffff' : '#64748b',
                  boxShadow: activeCategory === cat ? '0 4px 6px -1px rgba(79, 70, 229, 0.2)' : 'none'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Toggle Button */}
          <button 
            onClick={() => setShowHotOnly(!showHotOnly)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              backgroundColor: showHotOnly ? '#f97316' : '#ffffff',
              color: showHotOnly ? '#ffffff' : '#475569',
              border: showHotOnly ? 'none' : '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              alignSelf: isMobile ? 'flex-end' : 'auto'
            }}
          >
            <Flame size={14} fill={showHotOnly ? "currentColor" : "none"} /> 
            {showHotOnly ? "Hot" : "Latest"}
          </button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>
                {searchQuery !== '' ? `Results for "${searchQuery}"` : activeCategory !== 'All' ? `${activeCategory}` : "Discover"}
            </h2>
            <div style={{ height: '4px', width: '32px', backgroundColor: '#4f46e5', marginTop: '6px', borderRadius: '2px' }}></div>
        </div>

        {/* Grid Area */}
        {filteredPosts.length > 0 ? (
          <div style={gridStyle}>
            {filteredPosts.slice(0, 20).map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
             <Search size={40} color="#cbd5e1" style={{ marginBottom: '16px' }} />
             <h3 style={{ fontSize: '18px', fontWeight: '800' }}>No posts found</h3>
             <p style={{ color: '#64748b', fontSize: '14px' }}>Try searching for something else.</p>
          </div>
        )}
      </main>

      {/* Mobile Bottom Spacer */}
      {isMobile && <div style={{ height: '40px' }} />}
    </div>
  );
}