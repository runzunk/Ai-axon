import React, { useEffect, useRef } from 'react';
import { CheckCircle, Code, Terminal, Cpu } from 'lucide-react';

const Developers = () => {
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
        <section id="developers" className="container section-padding dark-bg" ref={sectionRef}>
            <h2 className="section-title fade-in-up">For <span className="gradient-text">Developers</span></h2>
            <div className="flex-row">
                <div className="prod-content fade-in-up">
                    <p style={{ color: 'var(--text-sec)', fontSize: '1.1rem', lineHeight: 1.8 }}>
                        Build the future faster with AI AXON's developer suite. Seamlessly integrate our APIs and supercharge your applications.
                    </p>
                    <ul className="prod-list">
                        <li><CheckCircle className="list-icon" /> RESTful API Access</li>
                        <li><CheckCircle className="list-icon" /> Real-time Webhooks</li>
                        <li><CheckCircle className="list-icon" /> 99.9% Uptime Guarantee</li>
                    </ul>
                </div>
                <div className="prod-visual fade-in-up">
                    <div className="floating-elements">
                        <div className="float-box fb-1"><Code /> API</div>
                        <div className="float-box fb-2"><Terminal /> CLI</div>
                        <div className="float-box fb-3"><Cpu /> SDK</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Developers;
