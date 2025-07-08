import React, { useState, useEffect } from 'react';

// Komponen Navbar yang dapat digunakan kembali
const Navbar = () => {
  // State untuk mengelola status buka/tutup menu mobile
  const [isOpen, setIsOpen] = useState(false);
  // State untuk melacak bagian (section) yang sedang aktif di viewport
  const [activeSection, setActiveSection] = useState('beranda'); // 'beranda' sebagai default awal

  // Definisi bagian-bagian navigasi dan teks yang ditampilkan
  const navSections = [
    { id: 'beranda', text: 'Beranda' },
    { id: 'fitur', text: 'Fitur' },
    { id: 'cara-kerja', text: 'Cara Kerja' },
    { id: 'manfaat', text: 'Manfaat' },
  ];

  // Fungsi untuk mengubah status menu mobile (buka/tutup)
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Fungsi untuk melakukan scroll ke bagian halaman tertentu berdasarkan ID
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false); // Tutup menu mobile setelah tautan diklik
    }
  };

  // Efek samping untuk mengelola IntersectionObserver
  useEffect(() => {
    const observerOptions = {
      root: null, // Mengacu pada viewport sebagai root
      rootMargin: '-50% 0px -50% 0px', // Adjusted to trigger when section is roughly in the middle
      threshold: 0, // Trigger when element starts to appear
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe each section defined in navSections
    navSections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    // Cleanup function to stop observing when the component unmounts
    return () => {
      navSections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [navSections]); // Dependency: effect will re-run if navSections changes

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 m-3 rounded-xl font-sans bg-[#001D3D] shadow-lg p-4 md:px-8 border border-[#003566]">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo atau Nama Aplikasi */}
        <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-[#FFC300] rounded-full flex items-center justify-center text-[#000814] font-bold text-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-2a1 1 0 11-2 0 1 1 0 012 0zm-7 4a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
            </div>
            <span className="text-xl font-extrabold text-[#FFD60A] tracking-wider">VOCABOOST AI</span>
        </div>

        {/* Hamburger Button for Mobile */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none focus:ring-2 focus:ring-[#FFC300] rounded-md p-2 transition-colors duration-200 hover:bg-[#003566]"
            aria-label="Toggle navigation"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              )}
            </svg>
          </button>
        </div>

        {/* Desktop Navigation Menu */}
        <div className="hidden md:flex space-x-6">
          {navSections.map((section) => (
            <NavLink
              key={section.id}
              sectionId={section.id}
              text={section.text}
              onClick={scrollToSection}
              isActive={activeSection === section.id} // Determine if this link is active
            />
          ))}
        </div>
      </div>

      {/* Mobile Navigation Menu (Conditional Rendering) */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-screen pt-4' : 'max-h-0'
        }`}
      >
        <div className="flex flex-col space-y-2">
          {navSections.map((section) => (
            <NavLink
              key={section.id}
              sectionId={section.id}
              text={section.text}
              onClick={scrollToSection}
              isMobile
              isActive={activeSection === section.id} // Determine if this link is active
            />
          ))}
        </div>
      </div>
    </nav>
  );
};

// Helper component for navigation links
const NavLink = ({ sectionId, text, isMobile = false, onClick, isActive }) => (
  <a
    href={`#${sectionId}`}
    onClick={(e) => {
      e.preventDefault();
      onClick(sectionId);
    }}
    className={`
      text-white // Default text color
      hover:text-[#FFC300] // Hover state for text
      font-medium
      transition-colors
      duration-300
      ${isMobile 
        ? 'block px-4 py-2 rounded-md hover:bg-[#003566]' 
        : 'px-4 py-2 rounded-lg hover:bg-[#003566]'} // Button-like appearance for desktop links
      ${isActive 
        ? 'font-bold text-[#FFC300] bg-[#003566] shadow-inner' // Active link style
        : ''} 
    `}
  >
    {text}
  </a>
);

export default Navbar;