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
  brandAddress?: string;
  companyName?: string;
  totalFee?: number | string;
  totalPaidToDate?: number | string;
  remainingBalance?: number | string;
}

export interface DailyReportPdfData {
  dateStr: string;
  generatedAtStr: string;
  totalLeads: number;
  demoSessions: number;
  admissionsToday: number;
  todaysCollection: number;
  monthlyCollection: number;
  pendingFees: number;
  overdueEmis: number;
}

/**
 * Generate 2-Page Native PDF Buffer (PDF-1.4 format) for Fee Receipts
 * Matching official CADD MANTRA / M/s CT ENTERPRISES receipt template
 */
export function generateReceiptPdfBuffer(data: ReceiptPdfData): Buffer {
  const brand = (data.brandName || "CADD MANTRA").replace(/[()]/g, "");
  const brandAddress = (data.brandAddress || "G 11 , Murli Bhawan , 10- A, Ashok Marg , Lucknow").replace(/[()]/g, "");
  const student = (data.studentName || "Student").replace(/[()]/g, "");
  const course = (data.courseName || "Course").replace(/[()]/g, "");
  const company = (data.companyName || "M/s CT ENTERPRISES").replace(/[()]/g, "");
  const mode = (data.paymentMode || "Online").replace(/[()]/g, "");
  const ref = (data.referenceNo || "N/A").replace(/[()]/g, "");
  const receiptNo = (data.receiptNo || "CM/CTE/2024/1230").replace(/[()]/g, "");
  const payDate = (data.paymentDate || new Date().toLocaleDateString("en-IN")).replace(/[()]/g, "");

  const amountVal = Number(data.amountPaid || 0);
  const amountStr = amountVal.toLocaleString("en-IN", { minimumFractionDigits: 2 });
  
  const finalFeeVal = Number(data.totalFee || amountVal);
  const totalPaidVal = Number(data.totalPaidToDate || amountVal);
  const remainingVal = Number(data.remainingBalance || 0);

  // --- PAGE 1 CONTENT STREAM ---
  const page1Lines = [
    // Header Left Logo + Company Details
    `BT /F2 18 Tf 0.72 0.11 0.11 rg 50 765 Td (CM) Tj ET`,
    `BT /F2 8.5 Tf 0.1 0.1 0.1 rg 50 750 Td (${brand}) Tj ET`,

    `BT /F2 12 Tf 0.1 0.1 0.1 rg 135 778 Td (${company}) Tj ET`,
    `BT /F2 9 Tf 0.1 0.5 0.2 rg 135 764 Td (${brand}) Tj ET`,
    `BT /F1 7.5 Tf 0.4 0.4 0.4 rg 135 752 Td (${brandAddress}) Tj ET`,

    // Header Right
    `BT /F2 11 Tf 0.1 0.6 0.2 rg 360 780 Td (Receipt # ${receiptNo}) Tj ET`,
    
    // Barcode Vector Graphic
    `0.1 0.1 0.1 rg`,
    `360 742 180 25 rectfill`,
    `1 1 1 rg`,
    `365 742 3 25 rectfill`, `372 742 2 25 rectfill`, `378 742 4 25 rectfill`,
    `386 742 2 25 rectfill`, `392 742 5 25 rectfill`, `402 742 3 25 rectfill`,
    `410 742 2 25 rectfill`, `416 742 4 25 rectfill`, `425 742 3 25 rectfill`,
    `433 742 5 25 rectfill`, `442 742 2 25 rectfill`, `450 742 4 25 rectfill`,
    `460 742 3 25 rectfill`, `470 742 2 25 rectfill`, `480 742 5 25 rectfill`,

    // Top Divider Line
    `0.85 0.85 0.85 rg 50 730 495 1 rectfill`,

    // Left Column Meta Box
    `0.96 0.96 0.96 rg 50 625 240 95 rectfill`,
    `0.85 0.85 0.85 rg 50 625 240 95 rectstroke`,
    `BT /F1 8.5 Tf 0.3 0.3 0.3 rg 55 707 Td (Receipt #) Tj ET`,
    `BT /F2 8.5 Tf 0.1 0.1 0.1 rg 140 707 Td (${receiptNo}) Tj ET`,
    `BT /F1 8.5 Tf 0.3 0.3 0.3 rg 55 688 Td (Receipt Date) Tj ET`,
    `BT /F1 8.5 Tf 0.1 0.1 0.1 rg 140 688 Td (${payDate}) Tj ET`,
    `BT /F1 8.5 Tf 0.3 0.3 0.3 rg 55 669 Td (Received In) Tj ET`,
    `BT /F1 8.5 Tf 0.1 0.1 0.1 rg 140 669 Td (${mode}) Tj ET`,
    `BT /F1 8.5 Tf 0.3 0.3 0.3 rg 55 650 Td (Cheque/Tran. Number) Tj ET`,
    `BT /F1 8.5 Tf 0.1 0.1 0.1 rg 140 650 Td (${ref}) Tj ET`,
    `BT /F1 8.5 Tf 0.3 0.3 0.3 rg 55 631 Td (Received Fee) Tj ET`,
    `BT /F2 8.5 Tf 0.1 0.1 0.1 rg 140 631 Td (${amountStr}) Tj ET`,

    // Right Column Received From & Green Pill
    `0.85 0.85 0.85 rg 305 700 240 20 rectfill`,
    `BT /F2 9 Tf 0.2 0.2 0.2 rg 310 706 Td (Received From :) Tj ET`,
    `BT /F2 10 Tf 0.1 0.1 0.1 rg 305 684 Td (${student}) Tj ET`,
    `BT /F1 8.5 Tf 0.3 0.3 0.3 rg 305 669 Td (Admission Batch : Lucknow) Tj ET`,
    `BT /F1 8.5 Tf 0.3 0.3 0.3 rg 305 654 Td (Lucknow) Tj ET`,

    // Solid Green Amount Pill
    `0.15 0.68 0.32 rg 305 625 240 22 rectfill`,
    `BT /F2 12 Tf 1 1 1 rg 400 632 Td (INR ${amountStr}) Tj ET`,

    // Invoice Details Section
    `BT /F2 10 Tf 0.1 0.1 0.1 rg 50 605 Td (Invoice Details) Tj ET`,
    `0.82 0.82 0.82 rg 50 585 495 18 rectfill`,
    `BT /F2 8 Tf 0.2 0.2 0.2 rg 55 590 Td (Received against Invoice #) Tj ET`,
    `BT /F2 8 Tf 0.2 0.2 0.2 rg 160 590 Td (Package Details) Tj ET`,
    `BT /F2 8 Tf 0.2 0.2 0.2 rg 300 590 Td (Fees Details) Tj ET`,
    `BT /F2 8 Tf 0.2 0.2 0.2 rg 370 590 Td (Invoice Date) Tj ET`,
    `BT /F2 8 Tf 0.2 0.2 0.2 rg 440 590 Td (Due Fee) Tj ET`,
    `BT /F2 8 Tf 0.2 0.2 0.2 rg 490 590 Td (Received Fee) Tj ET`,

    `BT /F1 8 Tf 0.2 0.2 0.2 rg 55 570 Td (566) Tj ET`,
    `BT /F1 8 Tf 0.2 0.2 0.2 rg 160 570 Td (${course}) Tj ET`,
    `BT /F1 8 Tf 0.2 0.2 0.2 rg 300 570 Td (Course Fees) Tj ET`,
    `BT /F1 8 Tf 0.2 0.2 0.2 rg 370 570 Td (${payDate}) Tj ET`,
    `BT /F1 8 Tf 0.2 0.2 0.2 rg 440 570 Td (${amountVal}) Tj ET`,
    `BT /F2 8 Tf 0.1 0.5 0.2 rg 490 570 Td (${amountVal}) Tj ET`,

    // Installment Payments Section
    `BT /F2 10 Tf 0.1 0.1 0.1 rg 50 545 Td (Installment Payments) Tj ET`,
    `0.82 0.82 0.82 rg 50 525 495 18 rectfill`,
    `BT /F2 8 Tf 0.2 0.2 0.2 rg 55 530 Td (Due Date) Tj ET`,
    `BT /F2 8 Tf 0.2 0.2 0.2 rg 120 530 Td (Invoice) Tj ET`,
    `BT /F2 8 Tf 0.2 0.2 0.2 rg 170 530 Td (Due Fee) Tj ET`,
    `BT /F2 8 Tf 0.2 0.2 0.2 rg 230 530 Td (Received Fee) Tj ET`,
    `BT /F2 8 Tf 0.2 0.2 0.2 rg 300 530 Td (Balance Fee) Tj ET`,
    `BT /F2 8 Tf 0.2 0.2 0.2 rg 390 530 Td (Payment Details) Tj ET`,

    `BT /F1 8 Tf 0.2 0.2 0.2 rg 55 510 Td (${payDate}) Tj ET`,
    `BT /F1 8 Tf 0.2 0.2 0.2 rg 120 510 Td (566) Tj ET`,
    `BT /F1 8 Tf 0.2 0.2 0.2 rg 170 510 Td (${finalFeeVal}) Tj ET`,
    `BT /F1 8 Tf 0.2 0.2 0.2 rg 230 510 Td (${totalPaidVal}) Tj ET`,
    `BT /F1 8 Tf 0.2 0.2 0.2 rg 300 510 Td (${remainingVal}) Tj ET`,
    `BT /F1 7.5 Tf 0.4 0.4 0.4 rg 390 510 Td (${receiptNo} ${payDate} ${amountVal} ${mode}) Tj ET`,

    // Totals Bar
    `0.88 0.88 0.88 rg 50 490 495 16 rectfill`,
    `BT /F2 8 Tf 0.1 0.1 0.1 rg 170 494 Td (${finalFeeVal}) Tj ET`,
    `BT /F2 8 Tf 0.1 0.5 0.2 rg 230 494 Td (${totalPaidVal}) Tj ET`,
    `BT /F2 8 Tf 0.7 0.1 0.1 rg 300 494 Td (${remainingVal}) Tj ET`,

    // Terms & Conditions Title
    `BT /F2 9.5 Tf 0.1 0.1 0.1 rg 50 465 Td (TERMS & CONDITIONS:) Tj ET`,
    `BT /F1 7.5 Tf 0.2 0.2 0.2 rg 50 450 Td (1. Payment made through cheque is subject to realization. In case cheque is returned / dishonored,) Tj ET`,
    `BT /F1 7.5 Tf 0.2 0.2 0.2 rg 50 440 Td (handling charges of Rs. 500/- along with bank charges will be collected in cash.) Tj ET`,

    `BT /F1 7.5 Tf 0.2 0.2 0.2 rg 50 425 Td (2. Student should strictly adhere to batch / schedule timings specified by centre.) Tj ET`,
    `BT /F1 7.5 Tf 0.2 0.2 0.2 rg 50 415 Td (All breaks must be pre-approved in writing not exceeding 2 months continuously.) Tj ET`,

    `BT /F1 7.5 Tf 0.2 0.2 0.2 rg 50 400 Td (3. Students joining through special scheme / discount cannot avail transfer facility.) Tj ET`,

    `BT /F1 7.5 Tf 0.2 0.2 0.2 rg 50 385 Td (4. Keep receipt safe. Must produce this receipt when collecting completion certificate.) Tj ET`,

    `BT /F1 7.5 Tf 0.2 0.2 0.2 rg 50 370 Td (5. Student is expected to maintain dignity, discipline and decorum of the centre.) Tj ET`,

    `BT /F1 7.5 Tf 0.2 0.2 0.2 rg 50 355 Td (6. Material losses due to mishandling of equipment by student must be paid by student.) Tj ET`,

    `BT /F1 7.5 Tf 0.2 0.2 0.2 rg 50 340 Td (7. Course fee once paid cannot be refunded after commencement of course.) Tj ET`,

    `BT /F1 7.5 Tf 0.2 0.2 0.2 rg 50 325 Td (8. FORCE MAJEURE: Design Gateway/CADD MANTRA accepts no liability for delay or non fulfilment.) Tj ET`,

    `BT /F1 7.5 Tf 0.2 0.2 0.2 rg 50 310 Td (9. Course combinations expected to change based on industry requirements.) Tj ET`,

    // Page Number
    `BT /F1 8 Tf 0.5 0.5 0.5 rg 490 30 Td (Page 1 of 2) Tj ET`,
  ];

  // --- PAGE 2 CONTENT STREAM ---
  const page2Lines = [
    `BT /F1 7.5 Tf 0.2 0.2 0.2 rg 50 780 Td (course by paying additional fee if required for the new combination.) Tj ET`,
    `BT /F1 7.5 Tf 0.2 0.2 0.2 rg 50 765 Td (10. Complete course within 12 months for diploma/short term. 2 years for master diploma.) Tj ET`,
    `BT /F1 7.5 Tf 0.2 0.2 0.2 rg 50 750 Td (11. Fee if paid in installment, all payments must be made per schedule discussed at admission.) Tj ET`,

    // Signature Line
    `0.5 0.5 0.5 rg 380 620 150 1 rectfill`,
    `BT /F2 9 Tf 0.2 0.2 0.2 rg 405 605 Td (Authorised Signatory) Tj ET`,

    // Page Number
    `BT /F1 8 Tf 0.5 0.5 0.5 rg 490 30 Td (Page 2 of 2) Tj ET`,
  ];

  const p1Text = page1Lines.join("\n");
  const p2Text = page2Lines.join("\n");

  const objects = [];
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`);
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>\nendobj`);
  objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 7 0 R >>\nendobj`);
  objects.push(`4 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 8 0 R >>\nendobj`);
  objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`);
  objects.push(`6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`);
  objects.push(`7 0 obj\n<< /Length ${Buffer.byteLength(p1Text)} >>\nstream\n${p1Text}\nendstream\nendobj`);
  objects.push(`8 0 obj\n<< /Length ${Buffer.byteLength(p2Text)} >>\nstream\n${p2Text}\nendstream\nendobj`);

  let header = "%PDF-1.4\n";
  let body = "";
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  let currentOffset = Buffer.byteLength(header);

  for (let i = 0; i < objects.length; i++) {
    const objStr = objects[i] + "\n";
    const offsetStr = String(currentOffset).padStart(10, "0");
    xref += `${offsetStr} 00000 n \n`;
    body += objStr;
    currentOffset += Buffer.byteLength(objStr);
  }

  const startxref = currentOffset;
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  const fullPdf = header + body + xref + trailer;
  return Buffer.from(fullPdf, "utf-8");
}

/**
 * Generate native PDF Buffer (PDF-1.4 format) for Daily Executive Summary Report
 */
export function generateDailyReportPdfBuffer(data: DailyReportPdfData): Buffer {
  const dateStr = (data.dateStr || new Date().toLocaleDateString("en-IN")).replace(/[()]/g, "");
  const genAtStr = (data.generatedAtStr || "").replace(/[()]/g, "");
  const leads = String(data.totalLeads ?? 0);
  const demos = String(data.demoSessions ?? 0);
  const admissions = String(data.admissionsToday ?? 0);
  const todayColl = `Rs. ${Number(data.todaysCollection || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const monthColl = `Rs. ${Number(data.monthlyCollection || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const pending = `Rs. ${Number(data.pendingFees || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const overdue = String(data.overdueEmis ?? 0);

  const contentLines = [
    `BT /F2 20 Tf 0.12 0.11 0.29 rg 50 780 Td (CADD MANTRA - DAILY EXECUTIVE REPORT) Tj ET`,
    `BT /F1 9 Tf 0.4 0.4 0.4 rg 50 765 Td (AUTOMATED DAILY PERFORMANCE & FINANCIAL SUMMARY) Tj ET`,
    `0.85 0.85 0.9 rg 50 750 495 1.5 rectfill`,

    `0.96 0.97 0.99 rg 50 675 495 60 rectfill`,
    `0.8 0.85 0.95 rg 50 675 495 60 rectstroke`,
    `BT /F2 11 Tf 0.2 0.2 0.7 rg 65 715 Td (REPORT DATE: ${dateStr}) Tj ET`,
    `BT /F1 10 Tf 0.3 0.3 0.3 rg 65 695 Td (GENERATED AT: ${genAtStr}    |    SCOPE: Midnight to Current Time) Tj ET`,

    `BT /F2 12 Tf 0.1 0.1 0.1 rg 50 640 Td (1. OPERATIONAL & LEAD METRICS) Tj ET`,
    `0.98 0.98 0.98 rg 50 545 495 80 rectfill`,
    `0.85 0.85 0.85 rg 50 545 495 80 rectstroke`,
    `BT /F1 10 Tf 0.2 0.2 0.2 rg 65 605 Td (Total New Leads Today: ${leads}) Tj ET`,
    `BT /F1 10 Tf 0.2 0.2 0.2 rg 65 585 Td (Demo Sessions Conducted / Updated Today: ${demos}) Tj ET`,
    `BT /F1 10 Tf 0.2 0.2 0.2 rg 65 565 Td (New Student Admissions Generated Today: ${admissions}) Tj ET`,

    `BT /F2 12 Tf 0.1 0.1 0.1 rg 50 510 Td (2. FINANCIAL & COLLECTION SUMMARY) Tj ET`,
    `0.94 0.96 1.0 rg 50 395 495 100 rectfill`,
    `0.75 0.8 0.95 rg 50 395 495 100 rectstroke`,
    `BT /F2 11 Tf 0.1 0.5 0.2 rg 65 470 Td (Today Collection (Midnight - Now): ${todayColl}) Tj ET`,
    `BT /F1 10 Tf 0.2 0.2 0.5 rg 65 450 Td (Monthly Total Collection (Current Month): ${monthColl}) Tj ET`,
    `BT /F1 10 Tf 0.6 0.2 0.2 rg 65 430 Td (Total Pending Fees Outstanding: ${pending}) Tj ET`,
    `BT /F1 10 Tf 0.7 0.3 0.1 rg 65 410 Td (Overdue EMI Accounts: ${overdue}) Tj ET`,

    `0.85 0.85 0.85 rg 50 340 495 1 rectfill`,
    `BT /F1 8 Tf 0.5 0.5 0.5 rg 50 325 Td (Computer generated official Executive Summary PDF Report. CADD MANTRA / Design Gateway.) Tj ET`,
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

/**
 * Generate native PDF Buffer (PDF-1.4 format) for Monthly MTD Executive Summary Report
 */
export function generateMonthlyReportPdfBuffer(data: DailyReportPdfData): Buffer {
  const dateStr = (data.dateStr || new Date().toLocaleDateString("en-IN")).replace(/[()]/g, "");
  const genAtStr = (data.generatedAtStr || "").replace(/[()]/g, "");
  const leads = String(data.totalLeads ?? 0);
  const demos = String(data.demoSessions ?? 0);
  const admissions = String(data.admissionsToday ?? 0);
  const monthColl = `Rs. ${Number(data.monthlyCollection || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const todayColl = `Rs. ${Number(data.todaysCollection || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const pending = `Rs. ${Number(data.pendingFees || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const overdue = String(data.overdueEmis ?? 0);

  const contentLines = [
    `BT /F2 20 Tf 0.12 0.11 0.29 rg 50 780 Td (CADD MANTRA - MONTHLY EXECUTIVE REPORT) Tj ET`,
    `BT /F1 9 Tf 0.4 0.4 0.4 rg 50 765 Td (MONTH-TO-DATE PERFORMANCE & FINANCIAL SUMMARY) Tj ET`,
    `0.85 0.85 0.9 rg 50 750 495 1.5 rectfill`,

    `0.96 0.97 0.99 rg 50 675 495 60 rectfill`,
    `0.8 0.85 0.95 rg 50 675 495 60 rectstroke`,
    `BT /F2 11 Tf 0.2 0.2 0.7 rg 65 715 Td (REPORT PERIOD: ${dateStr}) Tj ET`,
    `BT /F1 10 Tf 0.3 0.3 0.3 rg 65 695 Td (GENERATED AT: ${genAtStr}    |    SCOPE: Day 1 of Month to Current Execution Date) Tj ET`,

    `BT /F2 12 Tf 0.1 0.1 0.1 rg 50 640 Td (1. MONTH-TO-DATE OPERATIONAL & LEAD METRICS) Tj ET`,
    `0.98 0.98 0.98 rg 50 545 495 80 rectfill`,
    `0.85 0.85 0.85 rg 50 545 495 80 rectstroke`,
    `BT /F1 10 Tf 0.2 0.2 0.2 rg 65 605 Td (Total Month-To-Date Leads: ${leads}) Tj ET`,
    `BT /F1 10 Tf 0.2 0.2 0.2 rg 65 585 Td (Month-To-Date Demo Sessions Conducted / Updated: ${demos}) Tj ET`,
    `BT /F1 10 Tf 0.2 0.2 0.2 rg 65 565 Td (Month-To-Date New Student Admissions: ${admissions}) Tj ET`,

    `BT /F2 12 Tf 0.1 0.1 0.1 rg 50 510 Td (2. FINANCIAL & COLLECTION SUMMARY) Tj ET`,
    `0.94 0.96 1.0 rg 50 395 495 100 rectfill`,
    `0.75 0.8 0.95 rg 50 395 495 100 rectstroke`,
    `BT /F2 11 Tf 0.1 0.5 0.2 rg 65 470 Td (Total Monthly Revenue Collection (Day 1 - Date): ${monthColl}) Tj ET`,
    `BT /F1 10 Tf 0.2 0.2 0.5 rg 65 450 Td (Today's Collection: ${todayColl}) Tj ET`,
    `BT /F1 10 Tf 0.6 0.2 0.2 rg 65 430 Td (Total Pending Fees Outstanding: ${pending}) Tj ET`,
    `BT /F1 10 Tf 0.7 0.3 0.1 rg 65 410 Td (Overdue EMI Accounts: ${overdue}) Tj ET`,

    `0.85 0.85 0.85 rg 50 340 495 1 rectfill`,
    `BT /F1 8 Tf 0.5 0.5 0.5 rg 50 325 Td (Computer generated official Monthly Executive Summary PDF Report. CADD MANTRA / Design Gateway.) Tj ET`,
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
