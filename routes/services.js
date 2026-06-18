const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();

// File path for storing services data
const servicesFilePath = path.join(__dirname, '../services-data.json');

// Initialize services data file
const initServicesData = () => {
  if (!fs.existsSync(servicesFilePath)) {
    const defaultServices = [
      {
        id: "telecom",
        title: "Construction Material Supply & Procurement",
        description: "Sourcing and delivering essential building materials to construction sites efficiently and on time.",
        details: [
          "Cement, sand, aggregates & on-demand materials",
          "Quality steel reinforcement (rebar)",
          "Construction chemicals, electrical & sanitary supplies",
          "PVC, PPRC pipes, tiles & hardware",
          "Timely delivery with efficient logistics",
          "Bulk supply for all project types",
          "Competitive pricing with assured quality",
          "Complete one-stop material solution",
        ],
        image: "/1.jpeg"
      },
      {
        id: "tower",
        title: "Maintenance & Renovation Services",
        description: "Keeping your properties in peak condition through expert repairs, upgrades, and modern renovations tailored to every need.",
        details: [
          "Interior & exterior painting (residential, commercial & institutional)",
          "Waterproofing & leak protection solutions",
          "Minor repairs, upgrades & finishing works",
          "Full-scale renovation & remodeling projects",
          "Routine maintenance & on-demand workmanship",
          "Timely execution with minimal disruption",
          "Cost-effective solutions with lasting results",
        ],
        image: "/10.jpeg"
      },
      {
        id: "fiber",
        title: "Manufacturing of Telecommunication Towers & Maintenance",
        description: "End-to-end fiber cable laying solutions with trenching, installation and network deployment with precision.",
        details: [
          "Design and manufacturing of high-quality telecom towers",
          "Built for durability, safety, and long-term performance",
          "Repainting services for structural upkeep",
          "Corrosion protection for extended lifespan",
          "Structural repair and restoration work",
          "Ensuring uninterrupted network reliability",
          "Ongoing maintenance and technical support",
        ],
        image: "/2.jpeg"
      },
      {
        id: "fibernetwork",
        title: "Optical Fiber Cable Laying & Maintenance",
        description: "Proactive fiber network maintenance ensuring optimal performance, quick fault resolution and long-term network stability.",
        details: [
          "End-to-end fiber cable laying solutions",
          "Trenching, installation & network deployment with precision",
          "Maintenance services for optimal performance",
          "Quick fault detection and resolution to reduce downtime",
          "Ensuring long-term network stability through proactive upkeep",
        ],
        image: "/5.jpeg"
      },
      {
        id: "cctv",
        title: "CCTV, Access Control, Maintenance Procurement & Monitoring Systems",
        description: "Securing and monitoring your premises with advanced CCTV, access control, and smart procurement systems for seamless oversight and protection.",
        details: [
          "Advanced CCTV surveillance for real-time monitoring",
          "High-quality security fencing for strength and durability",
          "Comprehensive perimeter security to prevent unauthorized access",
          "Integrated detection, monitoring & rapid response systems",
          "Customized security solutions for all site types",
          "Reliable protection with 24/7 monitoring support",
          "Cost-effective and scalable security systems",
          "Ensuring complete safety and operational confidence",
        ],
        image: "/3.jpeg"
      },
      {
        id: "access",
        title: "Site Safety & Fire Fighting Equipment",
        description: "Safeguarding lives and assets with industry-grade fire fighting equipment and comprehensive site safety solutions.",
        details: [
          "Construction site safety equipment for hazard-free operations",
          "Certified fire safety systems (extinguisher, alarms & protection systems)",
          "Personal protective equipment (PPE) for workforce safety compliance",
          "End-to-end safety solutions with installation, inspection & maintenance",
          "Quick deployment for on-site safety readiness",
          "Cost-effective safety solutions for all project types",
          "Ensuring safe and compliant work environment",
        ],
        image: "/9.jpeg"
      },
      {
        id: "procurement",
        title: "Procurement",
        description: "Complete procurement solutions for power, IT, surveillance and Audio & Visual (SMDs) equipment tailored to client specs and OEM standards.",
        details: [
          "Enterprise power & energy solutions (UPS, batteries, PDUs, stabilizers & backup systems)",
          "IT, computing & AI-ready infrastructure (desktops, laptops, servers, storage & networking)",
          "Surveillance & access control systems (CCTV, ANPR, RFID & perimeter security devices)",
          "Audio-visual & conferencing solutions (PA systems, LED displays, SMDs, video walls & digital signage)",
          "End-to-end customized procurement as per client specs & OEM standards",
          "Project-based sourcing for specialized technical equipment",
          "Reliable supply chain with quality assurance",
          "Complete procurement solutions for all industries",
        ],
        image: "/8.jpeg"
      },
      {
        id: "construction",
        title: "Smart Infrastructure",
        description: "Building intelligent systems that connect technology and infrastructure for smarter, more efficient operations.",
        details: [
          "Technology-enabled civil construction with ICT, power & monitoring integration",
          "RFID-based access & mobility systems with ANPR, RFID & real-time reporting",
          "Centralized surveillance & security infrastructure with command center integration",
          "Smart energy & utility management with intelligent monitoring & backup systems",
          "Automated control systems for improved efficiency and operations",
          "Secure, scalable solution for modern infrastructure projects",
          "End-to-end smart infrastructure deployment and support",
        ],
        image: "/4.jpeg"
      }
    ];
    fs.writeFileSync(servicesFilePath, JSON.stringify(defaultServices, null, 2));
  }
};

// Get all services
router.get('/', (req, res) => {
  try {
    initServicesData();
    const services = JSON.parse(fs.readFileSync(servicesFilePath, 'utf8'));
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Error loading services' });
  }
});

// Update service
router.put('/:id', auth, (req, res) => {
  try {
    const { id } = req.params;
    const updatedService = req.body;
    
    let services = JSON.parse(fs.readFileSync(servicesFilePath, 'utf8'));
    const index = services.findIndex(s => s.id === id);
    
    if (index !== -1) {
      services[index] = { ...services[index], ...updatedService };
      fs.writeFileSync(servicesFilePath, JSON.stringify(services, null, 2));
      res.json(services[index]);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error updating service' });
  }
});

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Upload service image
router.post('/upload-image', auth, upload.single('image'), (req, res) => {
  try {
    const { serviceId } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;
    
    // Update service with new image
    let services = JSON.parse(fs.readFileSync(servicesFilePath, 'utf8'));
    const index = services.findIndex(s => s.id === serviceId);
    
    if (index !== -1) {
      services[index].image = imageUrl;
      fs.writeFileSync(servicesFilePath, JSON.stringify(services, null, 2));
    }
    
    res.json({ url: imageUrl });
  } catch (err) {
    res.status(500).json({ message: 'Error uploading image' });
  }
});

module.exports = router;