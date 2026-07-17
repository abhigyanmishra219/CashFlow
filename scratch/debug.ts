import mongoose from "mongoose";
import Admission from "../src/models/Admission";
import Payment from "../src/models/Payment";

async function fix() {
  await mongoose.connect('mongodb+srv://syncforgesolutions_db_user:MySecurePassword12@cluster0.jq4axfo.mongodb.net/syncforge_db?retryWrites=true&w=majority&appName=Cluster0');
  
  const adm = await Admission.findOne({ fullName: 'tarang singhal' });
  if (adm) {
    const p = new Payment({
      admissionId: adm._id,
      studentName: adm.fullName,
      amountReceived: adm.amountReceivedToday,
      paymentMode: adm.paymentMode,
      referenceNo: adm.transactionNo,
      company: adm.companyAssigned,
      paymentDate: adm.paymentDate || new Date(),
      particulars: {
        courseFeeDue: 0,
        registrationFeeDue: 0,
        materialFeeDue: 0,
        examFeeDue: 0
      }
    });
    await p.save();
    console.log("Fixed missing payment record for tarang singhal");
  } else {
    console.log("Admission not found");
  }
  process.exit(0);
}

fix().catch(console.error);
