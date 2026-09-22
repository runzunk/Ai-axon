import React, { useEffect, useRef } from 'react';

const About = () => {
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
        <section id="about" className="container section-padding text-center" ref={sectionRef}>
            <h2 className="section-title fade-in-up">About <span className="gradient-text">Us</span></h2>
            <div className="about-block fade-in-up">
                <h3>Ideas + AI = Real Impact</h3>
                <p>
                    We believe that Artificial Intelligence shouldn't just be a buzzword. It should be a tangible tool that helps creators, developers, and thinkers push the boundaries of what is possible. AI AXON is built to bridge the gap between human creativity and machine intelligence.
                </p>
            </div>
        </section>
    );
};

export default About;
