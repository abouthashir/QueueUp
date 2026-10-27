import { loadAuth } from '../authStorage';
import { AlertToast, BoardMockup, PhoneMockup } from '../marketing/Mockups';
import { SAMPLE_WAITING } from '../marketing/samples';
import SiteFooter from '../marketing/SiteFooter';
import SiteHeader from '../marketing/SiteHeader';
import TokenCard from '../token/TokenCard';
import { ButtonAnchor, ButtonLink } from '../ui/Button';
import Icon, { type IconName } from '../ui/Icon';
import Reveal from '../ui/Reveal';
import styles from './LandingPage.module.css';

const HERO_POINTS: { icon: IconName; text: string }[] = [
  { icon: 'phone', text: 'No app to install' },
  { icon: 'bell', text: 'Live place in line' },
  { icon: 'tap', text: 'One click to call next' },
];

const IDEAS = [
  { title: 'No app to install', text: 'The token opens in any phone browser.' },
  { title: 'Their place, live', text: 'The page changes the moment you call someone.' },
  { title: 'One click to call', text: 'Staff press Call next. That is the whole job.' },
];

const JOURNEY = [
  {
    token: SAMPLE_WAITING,
    title: 'Scan and step away',
    text: 'Their place in line and an honest wait time.',
  },
  {
    token: { ...SAMPLE_WAITING, peopleAhead: 0, estimatedWaitMinutes: 0 },
    title: "A chime when they're next",
    text: 'Time to head back. No one has to shout names.',
  },
  {
    token: { ...SAMPLE_WAITING, status: 'Called' as const, counterName: 'Counter 2', peopleAhead: 0 },
    title: 'The screen turns amber',
    text: 'Their number, and which counter to walk to.',
  },
];

const CUSTOMER_FACTS = [
  { term: 'Updates', text: 'Within about two seconds of every call' },
  { term: 'Name', text: 'Optional. No phone number, no password' },
  { term: 'Alerts', text: "A chime and a notification when they're next" },
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

        {/* ---------- The idea ---------- */}
        <section className={`container grid-12 ${styles.idea}`}>
          <p className={`label ${styles.sideLabel}`}>The idea</p>
          <Reveal className={styles.ideaBody}>
            <p className={styles.statement}>
              Most of a queue is people standing around.{' '}
              <span>QueueUp lets them wait wherever they like and tells them when to come back.</span>
            </p>
          </Reveal>
          <ol className={styles.ideaList}>
            {IDEAS.map((idea, index) => (
              <li key={idea.title}>
                <Reveal delay={index * 90}>
                  <span className={`label num ${styles.index}`}>0{index + 1}</span>
                  <h3>{idea.title}</h3>
                  <p>{idea.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Customers: the token's three moments ---------- */}
        <section id="customers" className={`container grid-12 ${styles.split}`}>
          <ol className={styles.journey}>
            {JOURNEY.map((step, index) => (
              <li key={step.title}>
                <Reveal delay={index * 110}>
                  <div className={`${styles.stage} ${step.token.status === 'Called' ? styles.stageTurn : ''}`}>
                    <TokenCard token={step.token} compact />
                  </div>
                  <span className={`label num ${styles.index}`}>0{index + 1}</span>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal className={styles.customersText}>
            <p className="label">For customers</p>
            <h2 className={styles.h2}>Their phone does the waiting.</h2>
            <p className={styles.body}>
              Scanning the poster gives them a token in the browser. From then on the page keeps them up to date, so they
              can sit outside, run an errand or stay in the car.
            </p>
            <dl className={styles.facts}>
              {CUSTOMER_FACTS.map((fact) => (
                <div key={fact.term}>
                  <dt>{fact.term}</dt>
                  <dd>{fact.text}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
