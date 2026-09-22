import React, { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Reacher from './components/Reacher';
import Developers from './components/Developers';
import About from './components/About';
import Footer from './components/Footer';

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <main className="content-wrapper">
        <Reacher />
        <Developers />
        <About />
        <Footer />
      </main>
    </>
  );
}

export default App;
