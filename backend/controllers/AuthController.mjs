import sha1 from 'sha1'; // For password hashing
import jwt from 'jsonwebtoken'; // For generating tokens
import { v4 as uuidv4 } from 'uuid'; // Import the v4 function from the uuid package
import redisClient from '../config/redis.mjs'; // Redis client
import dbClient from '../config/db.mjs'; // Database client
import sendEmail from '../utils/sendEmail.mjs'; // Import sendEmail function

class AuthController {
  static async register(req, res) {
    const {name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    try {
      const usersCollection = await dbClient.usersCollection();
      const existingUser = await usersCollection.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = sha1(password);
      const confirmationToken = uuidv4();
      const newUser = { name, email, password: hashedPassword, confirmed: false, confirmationToken, role: 'host' };
      await usersCollection.insertOne(newUser);

      // Send confirmation email (don't fail registration if email sending fails)
      const confirmationLink = `http://localhost:3000/api/auth/confirm-email?token=${confirmationToken}`;
      try {
        await sendEmail(email, 'Email Confirmation', `Click here to confirm your email: ${confirmationLink}`);
      } catch (emailErr) {
        console.error('Error sending confirmation email:', emailErr);
        // Return success but let client know email wasn't delivered
        return res.status(201).json({
          message: 'User registered successfully, but the confirmation email could not be sent. Please contact support or retry later.',
          emailSent: false,
        });
      }

      return res.status(201).json({ message: 'User registered successfully. Please check your email to confirm your account.', emailSent: true });
    } catch (error) {
      console.error('Error during registration:', error); // Add detailed logging
      if (error.message?.includes('not connected') || error.message?.includes('buffering timed out')) {
        return res.status(503).json({ 
          error: 'Database connection failed. Please ensure MongoDB is running. Start with: sudo systemctl start mongod or mongod' 
        });
      }
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const usersCollection = await dbClient.usersCollection();
      const hashedPassword = sha1(password);
      console.log('Hashed Password:', hashedPassword);

      const user = await usersCollection.findOne({ email, password: hashedPassword });

      if (!user) {
        console.log('User not found or invalid password');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log('Generated Token:', token); // Log the generated token
      await redisClient.set(`auth_${token}`, user._id.toString(), 86400);

      // Return token and user data (excluding password)
      const { password: _, ...userData } = user;
      return res.status(200).json({ token, user: userData });
    } catch (error) {
      console.error('Error during login:', error);
      if (error.message?.includes('not connected') || error.message?.includes('buffering timed out')) {
        return res.status(503).json({ 
          error: 'Database connection failed. Please ensure MongoDB is running.' 
        });
      }
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }

  static async logout(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized: No authorization header provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
      await redisClient.del(`auth_${token}`);
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Error during logout:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async requestPasswordReset(req, res) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    try {
      const usersCollection = await dbClient.usersCollection();
      const user = await usersCollection.findOne({ email });

      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      // Generate a password reset token
      const resetToken = uuidv4();
      await redisClient.set(`reset_${resetToken}`, user._id.toString(), 600); // Token expires in 10 minutes

      // Send the reset link via email
      const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
      await sendEmail(email, 'Password Reset', `Click here to reset your password: ${resetLink}`);

      res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
      console.error('Error during password reset request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async resetPassword(req, res) {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Missing token or new password' });
    }

    try {
      const userId = await redisClient.get(`reset_${token}`);
      if (!userId) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      const usersCollection = await dbClient.usersCollection();
      const hashedPassword = sha1(newPassword);
      await usersCollection.updateOne({ _id: userId }, { $set: { password: hashedPassword } });

      await redisClient.del(`reset_${token}`);
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error during password reset:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async confirmEmail(req, res) {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Missing token' });
    }

    try {
      const usersCollection = await dbClient.usersCollection();
      const user = await usersCollection.findOne({ confirmationToken: token });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      await usersCollection.updateOne({ _id: user._id }, { $set: { confirmed: true, confirmationToken: null } });

      res.status(200).json({ message: 'Email confirmed successfully' });
    } catch (error) {
      console.error('Error during email confirmation:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AuthController;