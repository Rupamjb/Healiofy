const Doctor = require('../models/Doctor');

// Sample data for doctors
const specialties = [
  'Cardiology',
  'Pediatrics',
  'General Practice',
  'Neurology',
  'Dermatology',
  'Orthopedics',
  'Psychiatry',
  'Gynecology',
  'Ophthalmology',
  'Endocrinology'
];

const availabilitySlots = [
  ['Mon 9:00-12:00', 'Thu 13:00-16:00'],
  ['Tue 10:00-13:00', 'Fri 14:00-17:00'],
  ['Wed 9:00-12:00', 'Fri 10:00-13:00'],
  ['Mon 14:00-17:00', 'Wed 10:00-13:00'],
  ['Tue 9:00-12:00', 'Thu 14:00-17:00']
];

const experiences = ['3 years', '5 years', '7 years', '10+ years', '15+ years', '20+ years'];

const availabilityStatus = [
  'Available Today',
  'Available Now',
  'Next 3 Days',
  'This Week'
];

// Array of specific doctors requested in the task
const specificDoctors = [
  {
    name: 'Dr. John Smith',
    specialty: 'Cardiology',
    availability: ['Mon 9:00-12:00', 'Thu 13:00-16:00'],
    bio: 'Board-certified cardiologist with 10+ years of experience in treating heart conditions.',
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4.8,
    experience: '10+ years',
    reviews: 124,
    price: 1500,
    isAvailableNow: true
  },
  {
    name: 'Dr. Emily Lee',
    specialty: 'Pediatrics',
    availability: ['Tue 10:00-13:00', 'Fri 14:00-17:00'],
    bio: 'Compassionate pediatrician dedicated to providing excellent care for children of all ages.',
    imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 4.9,
    experience: '7 years',
    reviews: 98,
    price: 1200,
    isAvailableNow: false
  },
  {
    name: 'Dr. Raj Patel',
    specialty: 'General Practice',
    availability: ['Wed 9:00-12:00', 'Fri 10:00-13:00'],
    bio: 'Experienced general practitioner focused on preventive care and managing chronic conditions.',
    imageUrl: 'https://randomuser.me/api/portraits/men/76.jpg',
    rating: 4.7,
    experience: '15+ years',
    reviews: 156,
    price: 1000,
    isAvailableNow: true
  }
];

// Additional doctors to reach 30 total
const additionalDoctors = [
  {
    name: 'Dr. Sarah Johnson',
    specialty: 'Neurology',
    bio: 'Neurologist specializing in headache disorders and neurodegenerative diseases.',
    imageUrl: 'https://randomuser.me/api/portraits/women/67.jpg'
  },
  {
    name: 'Dr. Michael Chen',
    specialty: 'Dermatology',
    bio: 'Dermatologist with expertise in treating acne, eczema, and skin cancer screening.',
    imageUrl: 'https://randomuser.me/api/portraits/men/52.jpg'
  },
  {
    name: 'Dr. Jessica Martinez',
    specialty: 'Psychiatry',
    bio: 'Psychiatrist specializing in anxiety disorders, depression, and ADHD management.',
    imageUrl: 'https://randomuser.me/api/portraits/women/56.jpg'
  },
  {
    name: 'Dr. David Wilson',
    specialty: 'Orthopedics',
    bio: 'Orthopedic surgeon with a focus on sports injuries and joint replacements.',
    imageUrl: 'https://randomuser.me/api/portraits/men/91.jpg'
  },
  {
    name: 'Dr. Lisa Patel',
    specialty: 'Gynecology',
    bio: 'OB/GYN providing comprehensive women\'s health services from adolescence through menopause.',
    imageUrl: 'https://randomuser.me/api/portraits/women/17.jpg'
  },
  {
    name: 'Dr. Robert Thompson',
    specialty: 'Ophthalmology',
    bio: 'Ophthalmologist specializing in cataract surgery and glaucoma management.',
    imageUrl: 'https://randomuser.me/api/portraits/men/55.jpg'
  },
  {
    name: 'Dr. Amanda Lee',
    specialty: 'Endocrinology',
    bio: 'Endocrinologist treating diabetes, thyroid disorders, and other hormonal conditions.',
    imageUrl: 'https://randomuser.me/api/portraits/women/33.jpg'
  },
  {
    name: 'Dr. Daniel Kim',
    specialty: 'Cardiology',
    bio: 'Interventional cardiologist specializing in coronary artery disease and heart failure.',
    imageUrl: 'https://randomuser.me/api/portraits/men/22.jpg'
  },
  {
    name: 'Dr. Sophia Rodriguez',
    specialty: 'Pediatrics',
    bio: 'Pediatrician with special interest in newborn care and childhood development.',
    imageUrl: 'https://randomuser.me/api/portraits/women/83.jpg'
  },
  {
    name: 'Dr. James Williams',
    specialty: 'General Practice',
    bio: 'Family physician providing comprehensive care for patients of all ages.',
    imageUrl: 'https://randomuser.me/api/portraits/men/39.jpg'
  },
  {
    name: 'Dr. Anna Garcia',
    specialty: 'Neurology',
    bio: 'Neurologist specializing in epilepsy, multiple sclerosis, and stroke recovery.',
    imageUrl: 'https://randomuser.me/api/portraits/women/26.jpg'
  },
  {
    name: 'Dr. Thomas Brown',
    specialty: 'Dermatology',
    bio: 'Dermatologist focused on skin cancer prevention and cosmetic dermatology.',
    imageUrl: 'https://randomuser.me/api/portraits/men/62.jpg'
  },
  {
    name: 'Dr. Maria Sanchez',
    specialty: 'Psychiatry',
    bio: 'Child and adolescent psychiatrist specializing in trauma and developmental disorders.',
    imageUrl: 'https://randomuser.me/api/portraits/women/90.jpg'
  },
  {
    name: 'Dr. Christopher Jones',
    specialty: 'Orthopedics',
    bio: 'Orthopedic surgeon specializing in minimally invasive procedures and sports medicine.',
    imageUrl: 'https://randomuser.me/api/portraits/men/41.jpg'
  },
  {
    name: 'Dr. Elizabeth Park',
    specialty: 'Gynecology',
    bio: 'Gynecologist specializing in endometriosis, PCOS, and minimally invasive surgery.',
    imageUrl: 'https://randomuser.me/api/portraits/women/54.jpg'
  },
  {
    name: 'Dr. Kevin Nguyen',
    specialty: 'Ophthalmology',
    bio: 'Ophthalmologist specializing in retinal diseases and diabetic eye care.',
    imageUrl: 'https://randomuser.me/api/portraits/men/68.jpg'
  },
  {
    name: 'Dr. Rachel Green',
    specialty: 'Endocrinology',
    bio: 'Endocrinologist with expertise in weight management and metabolic disorders.',
    imageUrl: 'https://randomuser.me/api/portraits/women/37.jpg'
  },
  {
    name: 'Dr. Omar Hassan',
    specialty: 'Cardiology',
    bio: 'Non-invasive cardiologist specializing in preventive cardiology and heart disease in women.',
    imageUrl: 'https://randomuser.me/api/portraits/men/85.jpg'
  },
  {
    name: 'Dr. Tina Wong',
    specialty: 'Pediatrics',
    bio: 'Pediatrician specializing in childhood asthma, allergies, and immunological disorders.',
    imageUrl: 'https://randomuser.me/api/portraits/women/27.jpg'
  },
  {
    name: 'Dr. Patrick Murphy',
    specialty: 'General Practice',
    bio: 'Family physician with a focus on geriatric care and chronic disease management.',
    imageUrl: 'https://randomuser.me/api/portraits/men/45.jpg'
  },
  {
    name: 'Dr. Jasmine Sharma',
    specialty: 'Neurology',
    bio: 'Neurologist specializing in movement disorders and Parkinson\'s disease.',
    imageUrl: 'https://randomuser.me/api/portraits/women/75.jpg'
  },
  {
    name: 'Dr. Alexander Davis',
    specialty: 'Dermatology',
    bio: 'Pediatric dermatologist treating common and rare skin conditions in children.',
    imageUrl: 'https://randomuser.me/api/portraits/men/15.jpg'
  },
  {
    name: 'Dr. Rebecca Mills',
    specialty: 'Psychiatry',
    bio: 'Psychiatrist specializing in mood disorders and cognitive behavioral therapy.',
    imageUrl: 'https://randomuser.me/api/portraits/women/46.jpg'
  },
  {
    name: 'Dr. Jordan Taylor',
    specialty: 'Orthopedics',
    bio: 'Orthopedic surgeon specializing in hand and upper extremity conditions.',
    imageUrl: 'https://randomuser.me/api/portraits/men/24.jpg'
  },
  {
    name: 'Dr. Olivia Foster',
    specialty: 'Gynecology',
    bio: 'OB/GYN with a focus on high-risk pregnancies and fertility issues.',
    imageUrl: 'https://randomuser.me/api/portraits/women/63.jpg'
  },
  {
    name: 'Dr. Nathan Campbell',
    specialty: 'Ophthalmology',
    bio: 'Ophthalmologist specializing in pediatric eye conditions and strabismus.',
    imageUrl: 'https://randomuser.me/api/portraits/men/77.jpg'
  },
  {
    name: 'Dr. Samantha Wright',
    specialty: 'Endocrinology',
    bio: 'Endocrinologist specializing in thyroid disorders and adrenal conditions.',
    imageUrl: 'https://randomuser.me/api/portraits/women/12.jpg'
  }
];

// Function to generate random integer between min and max (inclusive)
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to seed doctors
const seedDoctors = async () => {
  try {
    // Check if doctors already exist
    const existingDoctors = await Doctor.countDocuments();
    
    if (existingDoctors > 0) {
      console.log(`${existingDoctors} doctors already exist in the database`);
      return;
    }

    // Insert specific doctors first
    await Doctor.insertMany(specificDoctors);
    console.log('Specific doctors seeded successfully');
    
    // Process additional doctors to add missing fields
    const processedAdditionalDoctors = additionalDoctors.map(doctor => ({
      ...doctor,
      availability: availabilitySlots[getRandomInt(0, availabilitySlots.length - 1)],
      rating: parseFloat((4 + Math.random()).toFixed(1)),
      experience: experiences[getRandomInt(0, experiences.length - 1)],
      reviews: getRandomInt(50, 200),
      price: getRandomInt(800, 2000),
      isAvailableNow: Math.random() > 0.7
    }));
    
    // Insert additional doctors
    await Doctor.insertMany(processedAdditionalDoctors);
    console.log('Additional doctors seeded successfully');
    
    const totalDoctors = await Doctor.countDocuments();
    console.log(`Total of ${totalDoctors} doctors now in the database`);
  } catch (error) {
    console.error('Error seeding doctors:', error);
  }
};

module.exports = { seedDoctors }; 