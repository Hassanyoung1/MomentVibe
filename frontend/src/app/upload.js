import { useParams, Redirect } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import MediaUpload from './MediaUpload'; // Ensure this component exists

const UploadPage = () => {
  const { eventId } = useParams();
  const [needsRegistration, setNeedsRegistration] = useState(false);

  useEffect(() => {
    const checkEventVisibility = async () => {
      try {
        const res = await axios.get(`/api/events/${eventId}`);
        if (res.data.visibility === 'private') {
          setNeedsRegistration(true);
        }
      } catch (err) {
        console.error('Error fetching event:', err);
      }
    };
    checkEventVisibility();
  }, [eventId]);

  if (needsRegistration) {
    return <Redirect to={`/register-guest?eventId=${eventId}`} />;
  }

  return <MediaUpload eventId={eventId} />;
};

export default UploadPage;