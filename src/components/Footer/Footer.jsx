// Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaGithub,
  FaArrowRight,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="shape-fill"></path>
        </svg>
      </div>
      
      <div className="footer-container">
        {/* ====== Brand ====== */}
        <div className="footer-brand">
          <h2>
            <span className="brand-accent">Care</span> Home
          </h2>
          <p>Connecting Students & Companies for better opportunities.</p>
          
          <div className="contact-info">
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <span>contact@enjoyjobs.com</span>
            </div>
            <div className="contact-item">
              <FaPhone className="contact-icon" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="contact-item">
              <FaMapMarkerAlt className="contact-icon" />
              <span>123 Innovation St, Tech City</span>
            </div>
          </div>
        </div>

        {/* ====== Quick Links ====== */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/">
                <FaArrowRight className="link-arrow" />
                Home
              </Link>
            </li>
            <li>
              <Link to="/JobsList">
                <FaArrowRight className="link-arrow" />
                Jobs
              </Link>
            </li>
            <li>
              <Link to="/Freelancer">
                <FaArrowRight className="link-arrow" />
                Freelancer
              </Link>
            </li>
            <li>
              <Link to="/Client">
                <FaArrowRight className="link-arrow" />
                Client
              </Link>
            </li>
            <li>
              <Link to="/about">
                <FaArrowRight className="link-arrow" />
                About
              </Link>
            </li>
            <li>
              <Link to="/contact">
                <FaArrowRight className="link-arrow" />
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* ====== Newsletter ====== */}
        <div className="footer-newsletter">
          <h4>Stay Updated</h4>
          <p>Subscribe to our newsletter for the latest job opportunities and updates.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </div>
        </div>

        {/* ====== Social Links ====== */}
        <div className="footer-social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebook />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <FaTwitter />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FaGithub />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>© {new Date().getFullYear()} Enjoy Jobs. All rights reserved.</p>
          <div className="legal-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;