import React, { useEffect, useRef } from 'react';
import { Search, Zap, Database } from 'lucide-react';

const Reacher = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.15 }
        );

        const elements = sectionRef.current?.querySelectorAll('.fade-in-up');
        elements?.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <section id="reacher" className="container section-padding" ref={sectionRef}>
            <h2 className="section-title fade-in-up">AI <span className="gradient-text">Reacher</span></h2>
            <div className="tools-grid">
                <div className="glass-card fade-in-up">
                    <Search className="card-icon" />
                    <h3>Deep Search</h3>
                    <p>Find the exact information you need across millions of data points instantly.</p>
                </div>
                <div className="glass-card fade-in-up" style={{ transitionDelay: '0.1s' }}>
                    <Zap className="card-icon" />
                    <h3>Quick Insights</h3>
                    <p>Summarize lengthy articles and research papers into bite-sized actionable insights.</p>
                </div>
                <div className="glass-card fade-in-up" style={{ transitionDelay: '0.2s' }}>
                    <Database className="card-icon" />
                    <h3>Data Mining</h3>
                    <p>Extract structured data from unstructured sources with incredible accuracy.</p>
                </div>
            </div>
        </section>
    );
};

export default Reacher;
