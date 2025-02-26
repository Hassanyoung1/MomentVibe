import { useRouter } from 'next/router';
import QrCodeDisplay from '../../components/QrCodeDisplay';

const EventPage = () => {
  const router = useRouter();
  const { eventId } = router.query;

  if (!eventId) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Event QR Code</h1>
      <QrCodeDisplay eventId={eventId} />
    </div>
  );
};

export default EventPage;