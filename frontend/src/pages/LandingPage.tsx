import { loadAuth } from '../authStorage';
import { AlertToast, BoardMockup, CounterMockup, PhoneMockup } from '../marketing/Mockups';
import { SAMPLE_WAITING } from '../marketing/samples';
import SiteFooter from '../marketing/SiteFooter';
import SiteHeader from '../marketing/SiteHeader';
import TokenCard from '../token/TokenCard';
import { ButtonAnchor, ButtonLink } from '../ui/Button';
import Icon, { type IconName } from '../ui/Icon';
import Reveal from '../ui/Reveal';
import styles from './LandingPage.module.css';
import Photo from '../ui/Photo';

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

const STAFF_FACTS = [
  { term: 'Many counters', text: 'Pressing Call next together still calls two different people' },
  { term: 'Walk-ins', text: 'Issue a token at the desk for anyone without a phone' },
  { term: 'Skip & recall', text: 'Missed their turn? Call them back when your counter is free' },
];

const PLACES = [
  { photo: 'clinic', alt: 'A bright clinic corridor with waiting benches', title: 'Clinics', text: 'Patients wait outside or nearby instead of filling the corridor.' },
  { photo: 'bank', alt: 'A marble reception counter in a bank lobby', title: 'Banks', text: 'Several counters call from one shared queue, strictly in order.' },
  { photo: 'salon', alt: 'Three salon chairs facing round mirrors', title: 'Salons', text: 'Walk-ins get an honest wait time and can step out for a while.' },
];

const STEPS = [
  { title: 'Print the poster', text: 'Create a queue and print its A4 QR poster. Put it by the door.' },
  { title: 'Customers scan', text: 'They get a token number on their phone and can step away.' },
  { title: 'Call next', text: 'One button. The phone, the counter and the TV board change together.' },
];

const RULES = [
  { title: 'First come, first served', text: 'Numbers are given in order and start again each day.' },
  { title: 'No double calls', text: 'Two counters are never given the same person.' },
  { title: 'No sign-up for customers', text: 'A name is optional. Nothing else is asked.' },
  { title: 'Names erased after 30 days', text: 'QueueUp removes customer names on its own.' },
  { title: 'Your queues stay yours', text: 'Each business sees only its own queues and staff.' },
];

const FACTS = [
  { value: '0', text: 'apps to install' },
  { value: '1', text: 'click to call the next person' },
  { value: '2s', text: 'or less for every screen to update' },
  { value: '30', text: 'days, then names are erased' },
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
          <h2 className={`label ${styles.sideLabel}`}>The idea</h2>
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

        {/* ---------- Staff ---------- */}
        <section id="staff" className={`container grid-12 ${styles.split}`}>
          <Reveal className={styles.staffText}>
            <p className="label">For staff</p>
            <h2 className={styles.h2}>One button runs the queue.</h2>
            <p className={styles.body}>
              Call next brings the next person to your counter and updates every phone and the TV board at the same
              moment.
            </p>
            <dl className={styles.facts}>
              {STAFF_FACTS.map((fact) => (
                <div key={fact.term}>
                  <dt>{fact.term}</dt>
                  <dd>{fact.text}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <div className={styles.staffMedia}>
            <Photo
              name="staff-desk"
              alt="A wooden reception desk in a bright room"
              sizes="(min-width: 960px) 55vw, 100vw"
              className={styles.widePhoto}
            />
            <Reveal delay={150} className={styles.floatCounter}>
              <CounterMockup />
            </Reveal>
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section id="how" className={styles.nightFrame}>
          <div className={styles.night}>
            <div className={`grid-12 ${styles.nightHead}`}>
              <p className={`label ${styles.sideLabel}`}>How it works</p>
              <Reveal className={styles.nightTitle}>
                <h2 className={styles.h2}>From a paper poster to your first call.</h2>
              </Reveal>
            </div>

            <ol className={`grid-12 ${styles.steps}`}>
              {STEPS.map((step, index) => (
                <li key={step.title}>
                  <Reveal delay={index * 90}>
                    <span className={`num ${styles.stepNumber}`}>{index + 1}</span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </Reveal>
                </li>
              ))}
            </ol>

            <Reveal className={styles.boardWrap}>
              <BoardMockup large />
              <p className={styles.caption}>The TV board in your waiting area, readable from across the room.</p>
            </Reveal>
          </div>
        </section>

        {/* ---------- Places ---------- */}
        <section className={`container grid-12 ${styles.places}`}>
          <p className={`label ${styles.sideLabel}`}>Made for</p>
          <Reveal className={styles.placesTitle}>
            <h2 className={styles.h2}>Places where people wait their turn.</h2>
          </Reveal>

          <div className={styles.placeRow}>
            {PLACES.map((place, index) => (
              <Reveal key={place.title} delay={index * 90} className={styles.place}>
                <Photo name={place.photo} alt={place.alt} sizes="(min-width: 960px) 33vw, 80vw" className={styles.placePhoto} />
                <h3>{place.title}</h3>
                <p>{place.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- Fair & private ---------- */}
        <section id="fair" className={`container ${styles.fair}`}>
          <div className="grid-12">
            <Reveal className={styles.fairIntro}>
              <p className="label">Fair &amp; private</p>
              <h2 className={styles.h2}>The rules are built in.</h2>
              <p className={styles.body}>Fairness and privacy shouldn't depend on who is at the desk that day.</p>
            </Reveal>

            <ul className={styles.rules}>
              {RULES.map((rule) => (
                <li key={rule.title}>
                  <h3>{rule.title}</h3>
                  <p>{rule.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <ul className={styles.numbers}>
            {FACTS.map((fact, index) => (
              <li key={fact.value}>
                <Reveal delay={index * 80}>
                  <span className={`num ${styles.numberValue}`}>{fact.value}</span>
                  <span className={styles.numberText}>{fact.text}</span>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Closing ---------- */}
        <section className={styles.closingFrame}>
          <div className={`grid-12 ${styles.closing}`}>
            <Reveal className={styles.closingContent}>
              <p className={`label ${styles.closingLabel}`}>Start today</p>
              <h2 className={styles.closingTitle}>Your first customer is waiting.</h2>
              <p>Create a queue, print the poster and open your doors. It's free to start.</p>
              <div className={styles.actions}>
                <ButtonLink to={startTo} variant="light" size="lg">
                  {startLabel}
                  <Icon name="arrow" size={18} />
                </ButtonLink>
                {!loggedIn && (
                  <ButtonLink to="/login" variant="glass" size="lg">
                    Log in
                  </ButtonLink>
                )}
              </div>
            </Reveal>

            <div className={styles.nextToken} aria-hidden="true">
              <span className="label">Next token</span>
              <span className={`num ${styles.nextNumber}`}>A-001</span>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
