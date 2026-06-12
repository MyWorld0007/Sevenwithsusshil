import React from 'react';
import Home from './Home';
import About from './About';
import Process from './Process';
import Services from './Services';
import Calculator from './Calculator';
import Stories from './Stories';
import WhyChooseUs from './WhyChooseUs';
import Booking from './Booking';

export default function Landing() {
  return (
    <>
      <Home />
      <About />
      <WhyChooseUs />
      <Services />
      <Process />
      <Stories />
      <Calculator />
      <Booking />
    </>
  );
}
