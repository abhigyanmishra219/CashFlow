const fs = require('fs');

function generatePdfBuffer({ receiptNo, studentName, admissionId, courseName, amountPaid, paymentDate, brandName, companyName, remainingBalance }) {
  const contentLines = [
    `BT`,
    `/F2 20 Tf`,
    `0.12 0.11 0.29 rg`,
    `50 780 Td`,
    `(${brandName || "CADD MANTRA"}) Tj`,
    `ET`,
    `BT`,
    `/F1 9 Tf`,
    `0.4 0.4 0.4 rg`,
    `50 765 Td`,
    `(OFFICIAL FEE PAYMENT & ACKNOWLEDGEMENT RECEIPT) Tj`,
    `ET`,
    
    // Line separator
    `0.85 0.85 0.9 rg`,
    `50 750 495 1 rectfill`,
    
    // Receipt Metadata Box
    `0.96 0.97 0.99 rg`,
    `50 670 495 65 rectfill`,
    `0.8 0.85 0.95 rg`,
    `50 670 495 65 rectstroke`,
    
    `BT`,
    `/F2 10 Tf`,
    `0.2 0.2 0.6 rg`,
    `65 715 Td`,
    `(RECEIPT NO: ${receiptNo}) Tj`,
    `ET`,
    `BT`,
    `/F1 10 Tf`,
    `0.2 0.2 0.2 rg`,
    `65 695 Td`,
    `(DATE & TIME: ${paymentDate}) Tj`,
    `ET`,
    
    // Student Details Section
    `BT`,
    `/F2 11 Tf`,
    `0.1 0.1 0.1 rg`,
    `50 640 Td`,
    `(STUDENT & COURSE DETAILS) Tj`,
    `ET`,
    
    `BT`,
    `/F1 10 Tf`,
    `0.3 0.3 0.3 rg`,
    `50 620 Td`,
    `(Student Name: ${studentName}) Tj`,
    `ET`,
    `BT`,
    `/F1 10 Tf`,
    `0.3 0.3 0.3 rg`,
    `50 600 Td`,
    `(Admission ID: ${admissionId}) Tj`,
    `ET`,
    `BT`,
    `/F1 10 Tf`,
    `0.3 0.3 0.3 rg`,
    `50 580 Td`,
    `(Course Enrolled: ${courseName}) Tj`,
    `ET`,
    `BT`,
    `/F1 10 Tf`,
    `0.3 0.3 0.3 rg`,
    `50 560 Td`,
    `(Issued By: ${companyName}) Tj`,
    `ET`,

    // Financial Box
    `0.93 0.95 1.0 rg`,
    `50 470 495 70 rectfill`,
    `0.7 0.75 0.95 rg`,
    `50 470 495 70 rectstroke`,
    
    `BT`,
    `/F2 12 Tf`,
    `0.1 0.1 0.5 rg`,
    `65 520 Td`,
    `(AMOUNT RECEIVED TODAY: ${amountPaid}) Tj`,
    `ET`,
    `BT`,
    `/F2 11 Tf`,
    `0.2 0.5 0.2 rg`,
    `65 495 Td`,
    `(REMAINING OUTSTANDING BALANCE: ${remainingBalance}) Tj`,
    `ET`,
    
    // Footer Sign-off
    `0.85 0.85 0.85 rg`,
    `50 420 495 1 rectfill`,
    `BT`,
    `/F1 8 Tf`,
    `0.5 0.5 0.5 rg`,
    `50 400 Td`,
    `(Computer generated official PDF receipt. No signature required.) Tj`,
    `ET`
  ];

  const streamText = contentLines.join("\n");
  const streamLength = Buffer.byteLength(streamText);

  const objects = [];
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`);
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`);
  objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj`);
  objects.push(`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`);
  objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`);
  objects.push(`6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamText}\nendstream\nendobj`);

  let header = "%PDF-1.4\n";
  let body = "";
  let xref = "xref\n0 7\n0000000000 65535 f \n";
  
  let currentOffset = Buffer.byteLength(header);

  for (let i = 0; i < objects.length; i++) {
    const objStr = objects[i] + "\n";
    const offsetStr = String(currentOffset).padStart(10, "0");
    xref += `${offsetStr} 00000 n \n`;
    body += objStr;
    currentOffset += Buffer.byteLength(objStr);
  }

  const startxref = currentOffset;
  const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  const fullPdf = header + body + xref + trailer;
  return Buffer.from(fullPdf, "utf-8");
}

const pdfBuf = generatePdfBuffer({
  receiptNo: "REC-2026-79296",
  studentName: "Neha Verma",
  admissionId: "ADM000001",
  courseName: "Full Stack Development",
  amountPaid: "Rs. 1,455.00",
  paymentDate: "21 Jul 2026",
  brandName: "CADD MANTRA",
  companyName: "Design Gateway Pvt Ltd",
  remainingBalance: "Rs. 16,545.00"
});

fs.writeFileSync("scratch/test_receipt.pdf", pdfBuf);
console.log("PDF generated successfully! File size:", pdfBuf.length, "bytes");
