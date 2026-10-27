import { loadAuth } from '../authStorage';
import { AlertToast, BoardMockup, PhoneMockup } from '../marketing/Mockups';
import SiteFooter from '../marketing/SiteFooter';
import SiteHeader from '../marketing/SiteHeader';
import { ButtonAnchor, ButtonLink } from '../ui/Button';
import Icon, { type IconName } from '../ui/Icon';
import styles from './LandingPage.module.css';

const HERO_POINTS: { icon: IconName; text: string }[] = [
  { icon: 'phone', text: 'No app to install' },
  { icon: 'bell', text: 'Live place in line' },
  { icon: 'tap', text: 'One click to call next' },
];

export default function LandingPage() {
  const loggedIn = loadAuth() !== null;
  const startTo = loggedIn ? '/dashboard' : '/signup';
  const startLabel = loggedIn ? 'Go to your queues' : 'Create a free account';

  return (
    <>
      <SiteHeader loggedIn={loggedIn} />

      <main>
        {/* ---------- Hero ---------- */}
        <section className={styles.heroFrame}>
          <div className={styles.hero}>
            <div className={`grid-12 ${styles.guides}`} aria-hidden="true">
              {Array.from({ length: 12 }, (_, index) => (
                <span key={index} />
              ))}
            </div>

            <div className={styles.heroContent}>
              <p className={`label ${styles.heroChip}`}>Digital queue tokens</p>
              <h1 className={styles.heroTitle}>
                <span className={styles.line}>
                  <span>Wait anywhere.</span>
                </span>
                <span className={`${styles.line} ${styles.lineMuted}`}>
                  <span>Arrive on time.</span>
                </span>
              </h1>
              <p className={styles.heroLead}>
                Customers scan a QR code and get a token in their browser. No app, no sign-up. They watch their place live
                while your staff call the next person with one click.
              </p>
              <div className={styles.actions}>
                <ButtonLink to={startTo} size="lg">
                  {startLabel}
                  <Icon name="arrow" size={18} />
                </ButtonLink>
                <ButtonAnchor href="#how" variant="outline" size="lg">
                  See how it works
                </ButtonAnchor>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.heroPhone}>
                <PhoneMockup />
              </div>
              <div className={styles.heroToast}>
                <AlertToast />
              </div>
              <div className={styles.heroBoard}>
                <BoardMockup />
              </div>
            </div>

            <ul className={styles.heroPoints}>
              {HERO_POINTS.map((point) => (
                <li key={point.text}>
                  <Icon name={point.icon} size={18} />
                  {point.text}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
