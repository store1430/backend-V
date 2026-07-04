import "dotenv/config";
import { connectDB } from "./src/config/db.js";
import { Doctor } from "./src/models/Doctor.js";

const doctorUpdates = [
  {
    name: "Dr. Rajesh Kumar",
    education: "M.V.Sc (Surgery & Radiology)",
    bio: "Hi Pet Parents! I am Dr. Rajesh Kumar, a senior veterinary surgeon with over 12 years of experience. I specialize in complex orthopedic and soft-tissue surgeries for dogs, cats, and rabbits. I look forward to keeping your furry companions healthy and active!",
    languages: ["English", "Hindi", "Punjabi"],
    expertise: ["Dog", "Cat", "Rabbit"],
    jobsCompleted: 6037,
    rating: 4.85,
    reviews: [
      {
        reviewerName: "Amit Sharma",
        rating: 5,
        comment: "Dr. Rajesh is incredible! Saved my dog Bruno's leg after a bad accident. Highly recommended!",
        date: new Date(Date.now() - 3 * 24 * 3600000)
      },
      {
        reviewerName: "Sneha Goel",
        rating: 4,
        comment: "Very professional and detailed explanation of the surgical procedure.",
        date: new Date(Date.now() - 7 * 24 * 3600000)
      }
    ]
  },
  {
    name: "Dr. Sneha Sharma",
    education: "B.V.Sc & A.H, Cert. Veterinary Dentistry",
    bio: "Hello! I am Dr. Sneha Sharma. I specialize in pet dentistry and orthodontics. Clean teeth and healthy gums are key to a happy pet life. I have 8 years of experience performing root canals, dental cleanings, and managing oral tumors in dogs and cats.",
    languages: ["English", "Hindi", "Marathi"],
    expertise: ["Dog", "Cat"],
    jobsCompleted: 3450,
    rating: 4.75,
    reviews: [
      {
        reviewerName: "Pooja Patil",
        rating: 5,
        comment: "Excellent dental checkup. Cleaned my cat Luna's teeth. They smell great now!",
        date: new Date(Date.now() - 2 * 24 * 3600000)
      },
      {
        reviewerName: "Rohan Singh",
        rating: 4,
        comment: "Great doctor, explained oral hygiene tips for my pug Bruno. Very patient.",
        date: new Date(Date.now() - 10 * 24 * 3600000)
      }
    ]
  },
  {
    name: "Dr. Amit Patel",
    education: "M.V.Sc (Internal Medicine)",
    bio: "Hi there! I am Dr. Amit Patel, a dedicated veterinarian with 15 years of experience in internal medicine. I specialize in diagnosing complex medical conditions, allergy management, endocrinology, and preventative health care plans for pets.",
    languages: ["English", "Hindi", "Gujarati"],
    expertise: ["Dog", "Cat", "Bird"],
    jobsCompleted: 7890,
    rating: 4.90,
    reviews: [
      {
        reviewerName: "Kabir Roy",
        rating: 5,
        comment: "Dr. Amit is a blessing. Resolved my beagle's chronic skin allergy which was uncured for months.",
        date: new Date(Date.now() - 4 * 24 * 3600000)
      },
      {
        reviewerName: "Meera Nair",
        rating: 5,
        comment: "Incredibly knowledgeable and sweet with senior pets. The best vet in town!",
        date: new Date(Date.now() - 12 * 24 * 3600000)
      }
    ]
  },
  {
    name: "Dr. Priya Kumar",
    education: "M.V.Sc (Veterinary Pediatrics)",
    bio: "Hello, pet parents! I'm Dr. Priya Kumar. With 10 years of experience in veterinary medicine, I focus on pediatric care, vaccinations, nutrition guidance, and general wellness. I love guiding pet parents through their puppy or kitten's early stages!",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    expertise: ["Dog", "Cat"],
    jobsCompleted: 5120,
    rating: 4.80,
    reviews: [
      {
        reviewerName: "Karan Johar",
        rating: 5,
        comment: "Perfect first puppy checkup. Dr. Priya explained the vaccine schedule so clearly.",
        date: new Date(Date.now() - 1 * 24 * 3600000)
      },
      {
        reviewerName: "Ananya Panday",
        rating: 4,
        comment: "Very gentle with my kitten. Great nutritional advice provided.",
        date: new Date(Date.now() - 6 * 24 * 3600000)
      }
    ]
  }
];

async function run() {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Connected.");

    for (const update of doctorUpdates) {
      console.log(`Updating profile for ${update.name}...`);
      const res = await Doctor.findOneAndUpdate(
        { name: update.name },
        {
          $set: {
            education: update.education,
            bio: update.bio,
            languages: update.languages,
            expertise: update.expertise,
            jobsCompleted: update.jobsCompleted,
            rating: update.rating,
            reviews: update.reviews
          }
        },
        { new: true }
      );
      if (res) {
        console.log(`Successfully updated ${update.name}.`);
      } else {
        console.log(`Doctor ${update.name} not found!`);
      }
    }

    console.log("Seed complete!");
  } catch (error) {
    console.error("Error during seed:", error);
  } finally {
    process.exit(0);
  }
}

run();
