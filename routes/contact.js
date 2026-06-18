const express = require('express');
const sgMail = require('@sendgrid/mail');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const router = express.Router();

// Initialize SendGrid with API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || 'YOUR_SENDGRID_API_KEY_HERE');

router.post('/send', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please fill all required fields' });
  }

  try {
    // Verified sender (Change kiya hai)
    const verifiedSender = 'horizonintegratedsol@gmail.com';

    // Email to admin (horizonintegratedsol@gmail.com)
    const adminMsg = {
      to: 'horizonintegratedsol@gmail.com',
      from: verifiedSender,
      replyTo: email,
      subject: `New Contact Form: ${subject || 'General Inquiry'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #c9a84c; border-bottom: 2px solid #c9a84c; padding-bottom: 10px;">New Contact Form Submission</h2>
          
          <div style="margin: 20px 0;">
            <p><strong style="color: #0e2540;">Name:</strong> ${name}</p>
            <p><strong style="color: #0e2540;">Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong style="color: #0e2540;">Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong style="color: #0e2540;">Subject:</strong> ${subject || 'General Inquiry'}</p>
            <p><strong style="color: #0e2540;">Message:</strong></p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 5px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="font-size: 12px; color: #888; text-align: center; margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd;">
            Sent from Horizon Integrated Solutions Contact Form
          </div>
        </div>
      `
    };

    // Auto-reply to user
    const userMsg = {
      to: email,
      from: verifiedSender,
      subject: 'Thank you for contacting Horizon Integrated Solutions',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #c9a84c;">Horizon Integrated Solutions</h2>
          </div>
          
          <p>Dear <strong>${name}</strong>,</p>
          
          <p>Thank you for reaching out to us. We have received your message and one of our team members will get back to you within 24-48 hours.</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Your Message Summary:</strong></p>
            <p><em>${message.substring(0, 200)}${message.length > 200 ? '...' : ''}</em></p>
          </div>
          
          <p>In the meantime, you can reach us directly at:</p>
          <p>
            📞 Phone: +92 321-5366666<br>
            📧 Email: info@horizonintegratedsolutions.com
          </p>
          
          <hr style="margin: 20px 0;">
          
          <p style="font-size: 12px; color: #888;">Best regards,<br>
          <strong>Horizon Integrated Solutions Team</strong></p>
        </div>
      `
    };

    // Save to database
    await new Message({ name, email, phone, subject, message }).save();

    // Send both emails
    await sgMail.send(adminMsg);
    await sgMail.send(userMsg);

    console.log('\n========== EMAIL SENT SUCCESSFULLY VIA SENDGRID ==========');
    console.log('To: horizonintegratedsol@gmail.com');
    console.log('From:', email);
    console.log('Name:', name);
    console.log('================================================\n');

    res.json({ 
      success: true, 
      message: 'Thank you! We will contact you soon.' 
    });

  } catch (error) {
    console.error('SendGrid Error:', error.response?.body || error);
    res.status(500).json({ 
      error: 'Failed to send message. Please try again later.' 
    });
  }
});

// Get all messages (protected)
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a message (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    await message.deleteOne();
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;