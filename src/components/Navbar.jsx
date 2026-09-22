import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setScrolled(window.scrollY > 50);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    return (
        <>
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
                <div className="nav-container">
                    <div className="nav-left">
                        <div className="logo">
                            <svg viewBox="0 0 40 40" className="logo-svg">
                                <path d="M20,5 L35,35 L28,35 L20,15 L12,35 L5,35 Z" fill="url(#logoGrad)" />
                                <ellipse cx="20" cy="25" rx="18" ry="6" fill="none" stroke="#00F5B0" strokeWidth="1.5" transform="rotate(-15 20 25)"/>
                                <circle cx="6" cy="21" r="2" fill="#32F5D0" filter="drop-shadow(0 0 4px #32F5D0)"/>
                                <defs>
                                    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#E0E5E8" />
                                        <stop offset="100%" stopColor="#808C91" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span className="logo-text">AI AXON</span>
                        </div>
                    </div>
                    
                    <div className="nav-center">
                        <a href="#home" className="nav-link">Home</a>
                        <a href="#reacher" className="nav-link">Reacher</a>
                        <a href="#developers" className="nav-link">Developers</a>
                        <a href="#about" className="nav-link">About</a>
                    </div>
                    
                    <div className="nav-right">
                        <a href="#explore" className="btn-primary glow">Explore AI</a>
                    </div>
                    
                    <button className="mobile-menu-btn" onClick={toggleMenu} style={{ zIndex: 1001 }}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-nav-links">
                    <a href="#home" onClick={toggleMenu}>Home</a>
                    <a href="#reacher" onClick={toggleMenu}>Reacher</a>
                    <a href="#developers" onClick={toggleMenu}>Developers</a>
                    <a href="#about" onClick={toggleMenu}>About</a>
                    <a href="#explore" className="btn-primary glow mt-4" onClick={toggleMenu}>Explore AI</a>
                </div>
            </div>
        </>
    );
};

export default Navbar;
