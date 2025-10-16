import React from "react";
import { Link } from "react-router-dom";
import "./About.css";

const teamMembers = [
  {
    id: 1,
    name: "Ahmed Mohamed",
    role: "Founder & CEO",
    bio: "10+ years of experience in healthcare technology and business development.",
    avatar: "👨‍💼"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Head of Caregiver Services",
    bio: "Registered nurse with extensive experience in home care management.",
    avatar: "👩‍⚕️"
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "CTO",
    bio: "Technology expert focused on creating seamless user experiences.",
    avatar: "👨‍💻"
  },
  {
    id: 4,
    name: "Layla Hassan",
    role: "Community Manager",
    bio: "Dedicated to building strong relationships with families and caregivers.",
    avatar: "👩‍💼"
  }
];

const values = [
  {
    id: 1,
    title: "Compassion",
    desc: "We approach every interaction with empathy and understanding.",
    icon: "❤️"
  },
  {
    id: 2,
    title: "Trust",
    desc: "We build relationships based on transparency and reliability.",
    icon: "🤝"
  },
  {
    id: 3,
    title: "Excellence",
    desc: "We strive for the highest standards in everything we do.",
    icon: "⭐"
  },
  {
    id: 4,
    title: "Innovation",
    desc: "We continuously improve our platform to serve you better.",
    icon: "💡"
  }
];

const milestones = [
  { year: "2020", event: "Company Founded", desc: "Started with a vision to transform home care services" },
  { year: "2021", event: "Platform Launch", desc: "Launched our first version with basic booking features" },
  { year: "2022", event: "1000+ Users", desc: "Reached milestone of 1000 happy families and caregivers" },
  { year: "2023", event: "Mobile App", desc: "Launched our mobile application for iOS and Android" },
  { year: "2024", event: "Expansion", desc: "Expanded services to 5 new cities across the region" }
];

export default function About() {
  return (
    <main className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-container">
          <div className="about-hero-content">
            <h1>About HomeCare Connect</h1>
            <p className="about-hero-subtitle">
              We're on a mission to make quality home care accessible to everyone, 
              while empowering caregivers to build meaningful careers.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story">
        <div className="about-container">
          <div className="about-story-grid">
            <div className="about-story-content">
              <h2>Our Story</h2>
              <p>
                HomeCare Connect was founded in 2020 when our CEO, Ahmed, struggled to find 
                quality care for his aging parents. Frustrated with the lack of transparent, 
                reliable options in the market, he assembled a team of healthcare and technology 
                experts to create a better solution.
              </p>
              <p>
                Today, we've helped thousands of families find trusted caregivers for their 
                loved ones, and provided hundreds of care professionals with opportunities to 
                grow their careers while doing meaningful work.
              </p>
              <div className="about-stats">
                <div className="about-stat">
                  <span className="about-stat-number">2,500+</span>
                  <span className="about-stat-label">Happy Families</span>
                </div>
                <div className="about-stat">
                  <span className="about-stat-number">850+</span>
                  <span className="about-stat-label">Verified Caregivers</span>
                </div>
                <div className="about-stat">
                  <span className="about-stat-number">15,000+</span>
                  <span className="about-stat-label">Hours of Care Provided</span>
                </div>
              </div>
            </div>
            <div className="about-story-visual">
              <div className="about-visual-card">
                <div className="about-card-icon">👪</div>
                <h4>Family Focused</h4>
                <p>We prioritize the needs and safety of your loved ones above all else.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-mission">
        <div className="about-container">
          <div className="about-mission-grid">
            <div className="about-mission-card">
              <h2>Our Mission</h2>
              <p>
                To create a world where quality home care is accessible to every family, 
                and caregiving is recognized as the skilled, valuable profession it is.
              </p>
            </div>
            <div className="about-mission-card">
              <h2>Our Vision</h2>
              <p>
                To be the most trusted platform connecting families with exceptional 
                caregivers, through technology that puts people first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <div className="about-container">
          <div className="about-section-header">
            <h2>Our Values</h2>
            <p>These principles guide everything we do at HomeCare Connect</p>
          </div>
          <div className="about-values-grid">
            {values.map(value => (
              <div key={value.id} className="about-value-card">
                <div className="about-value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <div className="about-container">
          <div className="about-section-header">
            <h2>Meet Our Team</h2>
            <p>The passionate people behind HomeCare Connect</p>
          </div>
          <div className="about-team-grid">
            {teamMembers.map(member => (
              <div key={member.id} className="about-team-card">
                <div className="about-team-avatar">{member.avatar}</div>
                <h3>{member.name}</h3>
                <span className="about-team-role">{member.role}</span>
                <p>{member.bio}</p>
                <div className="about-team-social">
                  <button aria-label="LinkedIn">📱</button>
                  <button aria-label="Twitter">💬</button>
                  <button aria-label="Email">✉️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="about-timeline">
        <div className="about-container">
          <div className="about-section-header">
            <h2>Our Journey</h2>
            <p>Key milestones in our growth and development</p>
          </div>
          <div className="about-timeline-container">
            {milestones.map((milestone, index) => (
              <div key={index} className="about-timeline-item">
                <div className="about-timeline-marker"></div>
                <div className="about-timeline-content">
                  <span className="about-timeline-year">{milestone.year}</span>
                  <h3>{milestone.event}</h3>
                  <p>{milestone.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="about-container">
          <div className="about-cta-content">
            <h2>Join Our Community</h2>
            <p>
              Whether you're looking for care or want to provide it, we'd love to have you 
              as part of the HomeCare Connect family.
            </p>
            <div className="about-cta-buttons">
              <Link to="/register" className="about-btn about-btn-primary">
                Find Care Services
              </Link>
              <Link to="/register" className="about-btn about-btn-secondary">
                Become a Caregiver
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}