const express = require('express');
const Content = require('../models/Content');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all content
router.get('/', async (req, res) => {
  try {
    const content = await Content.find();
    const contentMap = {};
    content.forEach(c => {
      contentMap[c.section] = c;
    });
    res.json(contentMap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single content by section
router.get('/:section', async (req, res) => {
  try {
    const content = await Content.findOne({ section: req.params.section });
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json(content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update content (protected) - FIXED WARNING
router.put('/:section', auth, async (req, res) => {
  try {
    const { title, subtitle, description, data } = req.body;
    
    // Fixed: Using returnDocument: 'after' instead of 'new' option
    const content = await Content.findOneAndUpdate(
      { section: req.params.section },
      {
        title,
        subtitle,
        description,
        data,
        updatedAt: Date.now()
      },
      { 
        upsert: true, 
        returnDocument: 'after'  // This replaces 'new: true'
      }
    );
    
    res.json(content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize default content - FIXED WARNING
router.post('/init', async (req, res) => {
  try {
    const defaultContent = [
      {
        section: 'hero',
        title: 'HORIZON',
        subtitle: 'INTEGRATED SOLUTIONS',
        description: 'Complete infrastructure, technology & procurement services — specializing in Telecom Towers, CCTV Surveillance, Perimeter Fencing, Fiber Networks & construction sites supplies.'
      },
      {
        section: 'services',
        title: 'OUR SERVICES',
        description: 'Comprehensive infrastructure & technology solutions tailored for public and private sector projects.'
      },
      {
        section: 'contact',
        data: {
          email: 'info@horizon.com',
          phone: '+92 321 5366666',
          address: 'Lahore, Pakistan'
        }
      }
    ];
    
    for (const content of defaultContent) {
      // Fixed: Using returnDocument: 'after' instead of 'new: true'
      await Content.findOneAndUpdate(
        { section: content.section },
        content,
        { 
          upsert: true, 
          returnDocument: 'after'  // This replaces 'new: true'
        }
      );
    }
    
    res.json({ message: 'Default content initialized' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;