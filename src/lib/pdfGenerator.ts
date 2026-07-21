export interface ReceiptPdfData {
  receiptNo: string;
  studentName: string;
  admissionId?: string;
  courseName: string;
  amountPaid: number | string;
  paymentDate: string;
  paymentMode?: string;
  referenceNo?: string;
  brandName?: string;
  companyName?: string;
  totalFee?: number | string;
  totalPaidToDate?: number | string;
  remainingBalance?: number | string;
}

/**
 * Generate native PDF Buffer (PDF-1.4 format) for Fee Receipts
 */
export function generateReceiptPdfBuffer(data: ReceiptPdfData): Buffer {
  const brand = (data.brandName || "CADD MANTRA").replace(/[()]/g, "");
  const student = (data.studentName || "Student").replace(/[()]/g, "");
  const admission = (data.admissionId || "ADM-N/A").replace(/[()]/g, "");
  const course = (data.courseName || "Course").replace(/[()]/g, "");
  const company = (data.companyName || "Design Gateway Pvt Ltd").replace(/[()]/g, "");
  const mode = (data.paymentMode || "Cash").replace(/[()]/g, "");
  const ref = (data.referenceNo || "N/A").replace(/[()]/g, "");
  const receiptNo = (data.receiptNo || "GEN-001").replace(/[()]/g, "");

  const amountStr = `Rs. ${Number(data.amountPaid || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;

  const remainingStr =
    data.remainingBalance !== undefined
      ? `Rs. ${Number(data.remainingBalance || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })}`
      : "Rs. 0.00";

  const totalFeeStr =
    data.totalFee !== undefined
      ? `Rs. ${Number(data.totalFee || 0).toLocaleString("en-IN")}`
      : "N/A";

  const totalPaidStr =
    data.totalPaidToDate !== undefined
      ? `Rs. ${Number(data.totalPaidToDate || 0).toLocaleString("en-IN")}`
      : "N/A";

  const contentLines = [
    `BT`,
    `/F2 20 Tf`,
    `0.12 0.11 0.29 rg`,
    `50 780 Td`,
    `(${brand}) Tj`,
    `ET`,
    `BT`,
    `/F1 9 Tf`,
    `0.4 0.4 0.4 rg`,
    `50 765 Td`,
    `(OFFICIAL FEE PAYMENT & ACKNOWLEDGEMENT RECEIPT) Tj`,
    `ET`,

    // Header divider line
    `0.85 0.85 0.9 rg`,
    `50 750 495 1.5 rectfill`,

    // Receipt Meta Box
    `0.96 0.97 0.99 rg`,
    `50 665 495 70 rectfill`,
    `0.8 0.85 0.95 rg`,
    `50 665 495 70 rectstroke`,

    `BT`,
    `/F2 11 Tf`,
    `0.2 0.2 0.7 rg`,
    `65 715 Td`,
    `(RECEIPT NO: ${receiptNo}) Tj`,
    `ET`,
    `BT`,
    `/F1 10 Tf`,
    `0.2 0.2 0.2 rg`,
    `65 695 Td`,
    `(DATE & TIME: ${data.paymentDate || new Date().toLocaleDateString("en-IN")}) Tj`,
    `ET`,
    `BT`,
    `/F1 10 Tf`,
    `0.3 0.3 0.3 rg`,
    `65 678 Td`,
    `(PAYMENT MODE: ${mode}    |    REF NO: ${ref}) Tj`,
    `ET`,

    // Student & Course Details
    `BT`,
    `/F2 11 Tf`,
    `0.1 0.1 0.1 rg`,
    `50 630 Td`,
    `(STUDENT & COURSE DETAILS) Tj`,
    `ET`,

    `BT`,
    `/F1 10 Tf`,
    `0.3 0.3 0.3 rg`,
    `50 610 Td`,
    `(Student Name: ${student}) Tj`,
    `ET`,
    `BT`,
    `/F1 10 Tf`,
    `0.3 0.3 0.3 rg`,
    `50 590 Td`,
    `(Admission ID: ${admission}) Tj`,
    `ET`,
    `BT`,
    `/F1 10 Tf`,
    `0.3 0.3 0.3 rg`,
    `50 570 Td`,
    `(Course Enrolled: ${course}) Tj`,
    `ET`,
    `BT`,
    `/F1 10 Tf`,
    `0.3 0.3 0.3 rg`,
    `50 550 Td`,
    `(Entity / Company: ${company}) Tj`,
    `ET`,

    // Financial Box
    `0.93 0.95 1.0 rg`,
    `50 445 495 80 rectfill`,
    `0.7 0.75 0.95 rg`,
    `50 445 495 80 rectstroke`,

    `BT`,
    `/F2 12 Tf`,
    `0.1 0.1 0.6 rg`,
    `65 500 Td`,
    `(TOTAL AMOUNT RECEIVED TODAY: ${amountStr}) Tj`,
    `ET`,
    `BT`,
    `/F1 10 Tf`,
    `0.2 0.2 0.2 rg`,
    `65 480 Td`,
    `(Total Course Fee: ${totalFeeStr}    |    Total Paid To Date: ${totalPaidStr}) Tj`,
    `ET`,
    `BT`,
    `/F2 10 Tf`,
    `0.7 0.1 0.1 rg`,
    `65 460 Td`,
    `(REMAINING OUTSTANDING BALANCE: ${remainingStr}) Tj`,
    `ET`,

    // Footer
    `0.85 0.85 0.85 rg`,
    `50 390 495 1 rectfill`,
    `BT`,
    `/F1 8 Tf`,
    `0.5 0.5 0.5 rg`,
    `50 375 Td`,
    `(Computer generated official PDF receipt. Authenticated digitally. No signature required.) Tj`,
    `ET`,
  ];

  const streamText = contentLines.join("\n");
  const streamLength = Buffer.byteLength(streamText);

  const objects = [];
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`);
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`);
  objects.push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj`
  );
  objects.push(
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`
  );
  objects.push(
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`
  );
  objects.push(
    `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamText}\nendstream\nendobj`
  );

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
