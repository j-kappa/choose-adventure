import { Link } from 'react-router-dom';
import { Footer } from '../Footer';
import styles from './Terms.module.css';

export function Terms() {
  return (
    <div className={styles.container}>
      <article className={styles.content}>
        <Link to="/" className={styles.backLink}>
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Stories
        </Link>

        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.lastUpdated}>Last updated: January 1, 2026</p>

        <section className={styles.section}>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Adventure Engine ("the Service"), you accept and agree to be bound by 
            the terms and provisions of this agreement. If you do not agree to these terms, please do 
            not use the Service.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Description of Service</h2>
          <p>
            Adventure Engine is an interactive fiction platform that allows users to read and experience 
            branching narrative stories. The Service is provided for entertainment and educational purposes.
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. User Conduct</h2>
          <p>
            You agree to use the Service only for lawful purposes and in a manner that does not infringe 
            upon the rights of others or restrict their use and enjoyment of the Service.
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. Intellectual Property</h2>
          <p>
            All content included in the Service, such as text, graphics, logos, and software, is the 
            property of Adventure Engine or its content suppliers and is protected by applicable 
            intellectual property laws.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Story Content</h2>
          <p>
            Stories presented on this platform are works of fiction. Any resemblance to actual persons, 
            living or dead, or actual events is purely coincidental. The views and opinions expressed 
            in stories do not necessarily reflect those of Adventure Engine.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. Limitation of Liability</h2>
          <p>
            Adventure Engine shall not be liable for any indirect, incidental, special, consequential, 
            or punitive damages resulting from your use of or inability to use the Service.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any changes 
            by updating the "Last updated" date at the top of this page. Continued use of the Service 
            after changes constitutes acceptance of the modified terms.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Contact</h2>
          <p>
            If you have any questions about these Terms, please contact us through our official channels.
          </p>
        </section>
      </article>

      <Footer />
    </div>
  );
}

