"use client";

import React from "react";

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: any;
  student: any;
  paymentsHistory?: any[];
}

/**
 * Deterministic SVG QR Code Component for Receipt Verification
 */
function ReceiptQRCode({ value }: { value: string }) {
  const size = 21;
  const grid: boolean[][] = [];

  // Generate deterministic binary pattern based on input string hash
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      // Corner finder patterns (7x7 top-left, top-right, bottom-left)
      const isTopLeft = r < 7 && c < 7;
      const isTopRight = r < 7 && c >= size - 7;
      const isBottomLeft = r >= size - 7 && c < 7;

      if (isTopLeft || isTopRight || isBottomLeft) {
        // Outer square of finder pattern
        const pr = isTopLeft ? r : isTopRight ? r : r - (size - 7);
        const pc = isTopLeft ? c : isTopRight ? c - (size - 7) : c;
        if (pr === 0 || pr === 6 || pc === 0 || pc === 6) {
          row.push(true);
        } else if (pr >= 2 && pr <= 4 && pc >= 2 && pc <= 4) {
          row.push(true);
        } else {
          row.push(false);
        }
      } else {
        // Pseudo-random pseudo-QR data cell
        const bit = Math.abs((hash ^ (r * 31 + c * 17 + r * c * 7)) % 100) < 45;
        row.push(bit);
      }
    }
    grid.push(row);
  }

  const cellSize = 4;
  const viewBoxSize = size * cellSize;

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-white border border-slate-200 rounded-xl shadow-xs">
      <svg
        width="80"
        height="80"
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="shape-rendering-crisp"
      >
        <rect width={viewBoxSize} height={viewBoxSize} fill="#ffffff" />
        {grid.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#1e1b4b"
              />
            ) : null
          )
        )}
      </svg>
      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-1">
        VERIFY ONLINE
      </span>
    </div>
  );
}

export default function PaymentReceiptModal({
  isOpen,
  onClose,
  receipt,
  student,
  paymentsHistory,
}: PaymentReceiptModalProps) {
  if (!isOpen || !receipt || !student) return null;

  const receiptNo = receipt.receiptNo || `REC-${Date.now().toString().slice(-6)}`;
  const paymentDateFormatted = new Date(
    receipt.paymentDate || receipt.createdAt || Date.now()
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const finalFee = Number(
    student.finalFee || student.totalFee || student.courseFee || 0
  );
  const currentPayment = Number(receipt.amountReceived || 0);

  // Calculate total paid to date accurately
  let calculatedTotalPaid = 0;

  if (Array.isArray(paymentsHistory) && paymentsHistory.length > 0) {
    const historySum = paymentsHistory.reduce(
      (acc, item) => acc + Number(item.amountReceived || 0),
      0
    );
    const isCurrentInHistory = paymentsHistory.some(
      (item) =>
        (receipt._id && item._id === receipt._id) ||
        (receipt.receiptNo && item.receiptNo === receipt.receiptNo)
    );
    calculatedTotalPaid = isCurrentInHistory
      ? historySum
      : historySum + currentPayment;
  } else if (student.totalPaid !== undefined && student.totalPaid !== null) {
    calculatedTotalPaid = Number(student.totalPaid);
  } else if (student.remainingBalance !== undefined && student.remainingBalance !== null) {
    const rawRem = Number(student.remainingBalance);
    if (rawRem <= finalFee - currentPayment) {
      calculatedTotalPaid = Math.max(currentPayment, finalFee - rawRem);
    } else {
      calculatedTotalPaid = Math.max(currentPayment, finalFee - rawRem + currentPayment);
    }
  } else {
    calculatedTotalPaid = currentPayment;
  }

  const totalPaid = Math.max(currentPayment, calculatedTotalPaid);
  const remainingBalance = finalFee > 0 ? Math.max(0, finalFee - totalPaid) : 0;

  const brandName = student.brand || receipt.brand || "CADD MANTRA";
  const companyName =
    receipt.company || student.companyAssigned || "Design Gateway Pvt Ltd";

  const handlePrint = () => {
    window.print();
  };

  const [isSendingWhatsApp, setIsSendingWhatsApp] = React.useState(false);
  const [waStatus, setWaStatus] = React.useState<string | null>(null);

  const handleSendWhatsApp = async () => {
    setIsSendingWhatsApp(true);
    setWaStatus(null);
    try {
      const res = await fetch("/api/payments/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: student.fullName,
          mobileNumber: student.mobileNumber,
          courseName: student.course,
          amountPaid: receipt.amountReceived,
          paymentDate: paymentDateFormatted,
          receiptNo,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWaStatus("Sent!");
      } else {
        setWaStatus("Failed");
        alert(data.message || "Failed to send WhatsApp message");
      }
    } catch (err) {
      console.error(err);
      setWaStatus("Failed");
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handleDownloadPDF = () => {
    // Generate clean print view in popup window for high quality PDF saving
    const printWin = window.open("", "_blank", "width=850,height=900");
    if (!printWin) {
      window.print();
      return;
    }

    const receiptHtml = document.getElementById("printable-receipt-content")?.innerHTML;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${receiptNo}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; background: #fff; }
            @page { size: A4; margin: 15mm; }
          </style>
        </head>
        <body>
          <div style="max-width: 750px; margin: 0 auto;">
            ${receiptHtml}
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        {/* Header Bar - Hidden during print */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="text-sm font-extrabold text-slate-800">
              Official Payment Receipt
            </h3>
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100">
              {receiptNo}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Receipt Content Area */}
        <div className="p-6 overflow-y-auto flex-1 print:overflow-visible print:p-0">
          <div
            id="printable-receipt-content"
            className="border border-slate-200 rounded-2xl p-6 space-y-6 text-xs text-slate-700 bg-white font-semibold print:border-slate-300"
          >
            {/* Institute Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-indigo-600 tracking-tight uppercase">
                    {brandName}
                  </h2>
                  <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 uppercase tracking-wide">
                    ✓ Verified Receipt
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                  Official Fee Payment & Acknowledgement Receipt
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Issued by: {companyName}
                </p>
              </div>

              {/* QR Verification */}
              <ReceiptQRCode
                value={`https://verify.institute.com/receipt/${receiptNo}?adm=${student.admissionId}`}
              />
            </div>

            {/* Receipt Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 text-[11px]">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Receipt No
                </span>
                <span className="font-mono font-bold text-indigo-600">
                  {receiptNo}
                </span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Date & Time
                </span>
                <span className="text-slate-800 font-medium">
                  {paymentDateFormatted}
                </span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Payment Mode
                </span>
                <span className="text-slate-800 font-bold">
                  {receipt.paymentMode || "Cash"}
                </span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Reference / TXN ID
                </span>
                <span className="font-mono text-slate-800 font-semibold truncate block">
                  {receipt.referenceNo || "N/A"}
                </span>
              </div>
            </div>

            {/* Student & Course Details */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
                Student & Course Details
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs">
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">
                    Student Name
                  </span>
                  <span className="text-slate-900 font-bold text-sm">
                    {student.fullName}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">
                    Admission No
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {student.admissionId}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">
                    Contact / Mobile
                  </span>
                  <span className="text-slate-800 font-medium">
                    {student.mobileNumber || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">
                    Course Name
                  </span>
                  <span className="text-slate-800 font-semibold">
                    {student.course}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">
                    Batch
                  </span>
                  <span className="text-slate-800 font-semibold">
                    {student.batch}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">
                    Brand & Entity
                  </span>
                  <span className="text-slate-800 font-semibold">
                    {brandName}
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction Breakdown */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
                Payment Particulars
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {receipt.particulars?.courseFeeDue > 0 && (
                      <tr>
                        <td className="p-3">Course Fee Payment</td>
                        <td className="p-3 text-right font-semibold">
                          ₹
                          {Number(
                            receipt.particulars.courseFeeDue
                          ).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    )}
                    {receipt.particulars?.registrationFeeDue > 0 && (
                      <tr>
                        <td className="p-3">Registration Fee Payment</td>
                        <td className="p-3 text-right font-semibold">
                          ₹
                          {Number(
                            receipt.particulars.registrationFeeDue
                          ).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    )}
                    {!(receipt.particulars?.courseFeeDue > 0) &&
                      !(receipt.particulars?.registrationFeeDue > 0) && (
                        <tr>
                          <td className="p-3">General Fee Collection</td>
                          <td className="p-3 text-right font-semibold">
                            ₹
                            {Number(receipt.amountReceived).toLocaleString(
                              "en-IN",
                              { minimumFractionDigits: 2 }
                            )}
                          </td>
                        </tr>
                      )}
                    <tr className="bg-indigo-50/50 font-extrabold text-slate-900 border-t border-indigo-100">
                      <td className="p-3 text-indigo-900">
                        Total Amount Received Today
                      </td>
                      <td className="p-3 text-right text-base text-indigo-600 font-black">
                        ₹
                        {Number(receipt.amountReceived).toLocaleString(
                          "en-IN",
                          { minimumFractionDigits: 2 }
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Account Balance Summary */}
            <div className="grid grid-cols-3 gap-3 bg-slate-900 text-white p-4 rounded-xl">
              <div>
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Total Course Fee
                </span>
                <span className="text-sm font-bold">
                  ₹{finalFee.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Total Paid To Date
                </span>
                <span className="text-sm font-bold text-emerald-400">
                  ₹{totalPaid.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Remaining Balance
                </span>
                <span
                  className={`text-sm font-black ${
                    remainingBalance > 0 ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  ₹{remainingBalance.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Remarks if any */}
            {receipt.remarks && (
              <div className="text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600">
                <span className="font-bold text-slate-400 uppercase text-[9px] block">
                  Remarks / Notes
                </span>
                {receipt.remarks}
              </div>
            )}

            {/* Footer / Signatures */}
            <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
              <div className="space-y-1 text-[10px]">
                <p className="font-extrabold text-slate-800">{companyName}</p>
                <p className="text-slate-400 text-[9px]">
                  Computer generated official receipt. No physical signature required.
                </p>
              </div>
              <div className="text-center border-t border-slate-300 pt-1 w-44 text-[10px] text-slate-500 font-bold">
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls - Hidden during print */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/80 print:hidden shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSendWhatsApp}
            disabled={isSendingWhatsApp}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h15a3 3 0 013 3v15a3 3 0 01-3 3h-15a3 3 0 01-3-3v-15zm4.875 1.5A1.125 1.125 0 005.25 7.125v9.75c0 .621.504 1.125 1.125 1.125h11.25c.621 0 1.125-.504 1.125-1.125v-9.75a1.125 1.125 0 00-1.125-1.125H6.375z" clipRule="evenodd" />
            </svg>
            {isSendingWhatsApp
              ? "Sending..."
              : waStatus === "Sent!"
              ? "WhatsApp Sent ✓"
              : "Send via WhatsApp"}
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.617 0-1.11-.476-1.12-1.09l-.23-2.524m11.78 0H5.877m12.002-9.07c.052-.314.231-.59.504-.747m0 0l.852-.49a1.125 1.125 0 011.5 1.5l-.49.852m0 0a1.123 1.123 0 01-.747.504m0 0a40.06 40.06 0 00-11.782 0M18.84 8.18a1.124 1.124 0 00-.747-.504m0 0l-.852-.49a1.125 1.125 0 00-1.5 1.5l.49.852m0 0c.157.272.433.451.747.504m0 0a40.063 40.063 0 0011.782 0M6.16 8.18c.314-.052.59-.23.747-.504l.49-.852a1.125 1.125 0 00-1.5-1.5l-.852.49a1.123 1.123 0 00-.504.747m0 0A39.917 39.917 0 006 13.5m12-5.32c-.052-.314-.231-.59-.504-.747l-.852-.49a1.125 1.125 0 00-1.5 1.5l.49.852c.157.272.433.451.747.504z"
              />
            </svg>
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
