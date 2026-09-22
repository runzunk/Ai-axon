import React from 'react';

const Footer = () => {
    return (
        <footer className="footer container">
            <div className="footer-content">
                <div className="footer-brand">
                    <div className="logo-text">AI AXON</div>
                    <div className="footer-tagline">
                        <span>THINK</span> <span className="sep">|</span> 
                        <span>CREATE</span> <span className="sep">|</span> 
                        <span>GROW</span>
                    </div>
                </div>
                <div className="footer-links">
                    <a href="#home">Home</a>
                    <a href="#reacher">Reacher</a>
                    <a href="#developers">Developers</a>
                    <a href="#about">About</a>
                </div>
            </div>
            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} AI AXON. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
