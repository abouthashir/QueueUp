import type { QueueInfo } from '../api';

const sampleQueue: QueueInfo = {
    id: 'c250ddb5-277c-4dd9-b1d6-e3b230bb69ac',
    name: 'General OPD',
    status: 'Open',
    peopleWaiting: 3,
    estimatedWaitMinutes: 15,
};

export default function JoinPage() {
    const queue = sampleQueue;

    return (
        <main className="page">
            <h1>{queue.name}</h1>

            {queue.status === 'Open' && (
                <>
                    <p className="summary">
                        {queue.peopleWaiting} {queue.peopleWaiting === 1 ? 'person' : 'people'} waiting · about{' '}
                        {queue.estimatedWaitMinutes} min
                    </p>

                    <form className="join-form">
                        <label htmlFor="customer-name">Your name (optional)</label>
                        <input id="customer-name" type="text" autoComplete="given-name" maxLength={100} />

                        <button type="submit">Get token</button>
                    </form>
                </>
            )}

            {queue.status === 'Paused' && <p className="notice">The queue is paused. Back soon.</p>}
            {queue.status === 'Closed' && <p className="notice">The queue is closed for today.</p>}
        </main>
    );
}
