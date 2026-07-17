import mongoose from "mongoose";
import Admission from "../src/models/Admission";
import Payment from "../src/models/Payment";

async function seed() {
  await mongoose.connect('mongodb+srv://syncforgesolutions_db_user:MySecurePassword12@cluster0.jq4axfo.mongodb.net/syncforge_db?retryWrites=true&w=majority&appName=Cluster0');
  console.log("Connected to DB");

  const a1 = new Admission({
    fullName: "Priya Sharma",
    mobileNumber: "9876543210",
    email: "priya@example.com",
    city: "Mumbai",
    state: "MH",
    pincode: "400001",
    counsellor: "Rahul",
    brand: "TechPro",
    course: "Full Stack Web Dev",
    batch: "Morning",
    duration: "6 Months",
    startDate: new Date(),
    academicYear: "2026",
    admissionDate: new Date(),
    companyAssigned: "Infosys",
    courseFee: 50000,
    finalFee: 45000,
    paymentMode: "UPI",
    transactionNo: "TXN123",
    amountReceivedToday: 20000,
    paymentDate: new Date(),
    remainingBalance: 25000
  });
  await a1.save();

  const p1 = new Payment({
    admissionId: a1._id,
    studentName: a1.fullName,
    amountReceived: 20000,
    paymentMode: "UPI",
    referenceNo: "TXN123",
    company: "Infosys",
    paymentDate: new Date()
  });
  await p1.save();

  const a2 = new Admission({
    fullName: "Aman Gupta",
    mobileNumber: "9988776655",
    email: "aman@example.com",
    city: "Delhi",
    state: "DL",
    pincode: "110001",
    counsellor: "Rahul",
    brand: "DataCamp",
    course: "Data Science",
    batch: "Evening",
    duration: "6 Months",
    startDate: new Date(),
    academicYear: "2026",
    admissionDate: new Date(),
    companyAssigned: "TCS",
    courseFee: 60000,
    finalFee: 60000,
    paymentMode: "Bank Transfer",
    transactionNo: "TXN456",
    amountReceivedToday: 30000,
    paymentDate: new Date(),
    remainingBalance: 30000
  });
  await a2.save();

  const p2 = new Payment({
    admissionId: a2._id,
    studentName: a2.fullName,
    amountReceived: 30000,
    paymentMode: "Bank Transfer",
    referenceNo: "TXN456",
    company: "TCS",
    paymentDate: new Date()
  });
  await p2.save();

  console.log("Seeded 2 admissions and 2 payments");
  process.exit(0);
}

seed().catch(console.error);
