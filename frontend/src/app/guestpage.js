import { useParams } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const GuestRegistration = () => {
  const { eventId } = useParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/guests/register', { eventId, name, email });
      // Redirect to upload page after registration
      window.location.href = `/upload?eventId=${eventId}`;
    } catch (err) {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        placeholder="Name" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
      />
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default GuestRegistration;