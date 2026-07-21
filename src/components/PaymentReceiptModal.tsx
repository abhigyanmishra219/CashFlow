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

/**
 * Official CADD MANTRA Logo Vector Component
 */
function CaddMantraLogo() {
  return (
    <div className="flex flex-col items-center justify-center shrink-0">
      <svg width="110" height="44" viewBox="0 0 120 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M18 30 C8 30 6 12 18 12 C28 12 30 22 34 30 L40 30 L40 12 L46 12 L46 30 L52 30 L52 12 L58 12 L58 30 L64 30 L64 12"
          stroke="#B91C1C"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 22 C14 8 46 6 62 14"
          stroke="#B91C1C"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="68" cy="8" r="3" stroke="#334155" strokeWidth="0.8" />
        <text x="66.5" y="10" fontSize="4.5" fontWeight="bold" fill="#334155">R</text>
        <text x="2" y="44" fontSize="10.5" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" fill="#000000" letterSpacing="1.2">
          CADD MANTRA
        </text>
      </svg>
    </div>
  );
}

/**
 * Code128 Style Vector Barcode Component
 */
function ReceiptBarcode() {
  const bars: number[] = [3,1,2,1,1,3,1,1,2,3,1,1,1,2,3,1,3,1,1,2,1,3,2,1,1,1,3,2,1,2,1,1,3,1,2,1,1,3];
  return (
    <div className="flex flex-col items-end">
      <svg width="160" height="35" viewBox="0 0 160 35" className="shape-rendering-crisp">
        <rect width="160" height="35" fill="#ffffff" />
        {bars.map((width, idx) => {
          const x = idx * 4 + 2;
          return idx % 2 === 0 ? (
            <rect key={idx} x={x} y="0" width={width * 1.5} height="35" fill="#000000" />
          ) : null;
        })}
      </svg>
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

  const [matchedBrand, setMatchedBrand] = React.useState<any>(null);

  const rawCompany = matchedBrand?.companies?.[0] || (receipt.company && receipt.company !== "Cash" && receipt.company !== "Unallocated" ? receipt.company : null) || (student.companyAssigned && student.companyAssigned !== "Cash" && student.companyAssigned !== "Unallocated" ? student.companyAssigned : null);
  const companyName = rawCompany || "M/s CT ENTERPRISES";
  const brandName = matchedBrand?.name || student.brand || student.brandName || receipt.brand || receipt.brandName || "CADD MANTRA";
  const brandAddress = matchedBrand?.address || "G 11 , Murli Bhawan , 10- A, Ashok Marg , Lucknow";
  
  // Resolve brand logo: use logoUrl or receiptTemplateUrl if image
  const brandLogoUrl = matchedBrand?.logoUrl || (matchedBrand?.receiptTemplateUrl && !matchedBrand.receiptTemplateUrl.toLowerCase().endsWith(".pdf") ? matchedBrand.receiptTemplateUrl : null);
  const customTerms = matchedBrand?.receiptTerms;
  const brandReceiptTemplateUrl = matchedBrand?.receiptTemplateUrl;

  React.useEffect(() => {
    if (isOpen) {
      fetch("/api/brands")
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.brands) && data.brands.length > 0) {
            const rawTarget = (
              student.brand ||
              student.brandName ||
              student.enquiryBrand ||
              receipt.brand ||
              receipt.brandName ||
              ""
            ).toString().toLowerCase().trim();

            const found = data.brands.find((b: any) => {
              const name = (b.name || "").toLowerCase().trim();
              const code = (b.code || "").toLowerCase().trim();
              return (
                (rawTarget && name.includes(rawTarget)) ||
                (rawTarget && rawTarget.includes(name)) ||
                (code && code === rawTarget)
              );
            });

            if (found) {
              setMatchedBrand(found);
            } else if (data.brands.length === 1) {
              // Fallback to sole active brand if only 1 exists
              setMatchedBrand(data.brands[0]);
            }
          }
        })
        .catch(console.error);
    }
  }, [isOpen, student, receipt]);

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
            {brandReceiptTemplateUrl && (
              <a
                href={brandReceiptTemplateUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-all flex items-center gap-1"
                title="View original uploaded Brand PDF template"
              >
                <span>📄 Brand Format PDF</span>
              </a>
            )}
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
            className="border border-slate-200 rounded-xl p-6 space-y-5 text-xs text-slate-800 bg-white font-sans print:border-none print:p-0"
          >
            {/* Header: Logo, Company, Address, Green Receipt #, Barcode */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div className="flex items-center gap-4">
                {brandLogoUrl ? (
                  <img src={brandLogoUrl} alt={brandName} className="h-12 max-w-[120px] object-contain shrink-0" />
                ) : (
                  <CaddMantraLogo />
                )}
                <div>
                  <h1 className="text-sm font-bold text-slate-900 leading-tight">
                    {companyName}
                  </h1>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                    {brandName}
                  </p>
                  <p className="text-[11px] text-slate-600 font-normal mt-0.5">
                    {brandAddress}
                  </p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <h3 className="text-sm font-bold text-emerald-600">
                  Receipt # {receiptNo}
                </h3>
                <ReceiptBarcode />
              </div>
            </div>

            {/* Meta & Received From 2-Column Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Receipt Meta Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-slate-50">
                      <td className="py-1.5 px-3 font-semibold text-slate-600">Receipt #</td>
                      <td className="py-1.5 px-3 font-bold text-slate-900">{receiptNo}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-semibold text-slate-600">Receipt Date</td>
                      <td className="py-1.5 px-3 font-semibold text-slate-900">{paymentDateFormatted}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="py-1.5 px-3 font-semibold text-slate-600">Received In</td>
                      <td className="py-1.5 px-3 font-semibold text-slate-900">{receipt.paymentMode || "Online"}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-semibold text-slate-600">Cheque/Tran. Number</td>
                      <td className="py-1.5 px-3 font-mono text-slate-800">{receipt.referenceNo || "N/A"}</td>
                    </tr>
                    <tr className="bg-slate-50 border-t border-slate-200">
                      <td className="py-1.5 px-3 font-bold text-slate-700">Received Fee</td>
                      <td className="py-1.5 px-3 font-bold text-slate-900">
                        {Number(receipt.amountReceived || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Right Column: Received From & Green Badge */}
              <div className="flex flex-col justify-between border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50 p-3">
                <div>
                  <div className="bg-slate-200/80 px-2 py-1 text-[11px] font-bold text-slate-700 uppercase mb-2">
                    Received From :
                  </div>
                  <p className="text-sm font-bold text-slate-900">{student.fullName}</p>
                  <p className="text-xs text-slate-600 font-medium">
                    Admission Batch : <span className="font-semibold text-slate-800">{student.batch || student.city || "Lucknow"}</span>
                  </p>
                  <p className="text-xs text-slate-500">{student.city || "Lucknow"}</p>
                </div>

                <div className="mt-4 bg-emerald-600 text-white font-bold text-base py-2 px-4 rounded-md text-center shadow-xs tracking-wide">
                  ₹ {Number(receipt.amountReceived || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Invoice Details Table */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1">
                Invoice Details
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-200/80 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-2">Received against Invoice #</th>
                      <th className="p-2">Package Details</th>
                      <th className="p-2">Fees Details</th>
                      <th className="p-2">Invoice Date</th>
                      <th className="p-2 text-right">Due Fee</th>
                      <th className="p-2 text-right">Received Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    <tr>
                      <td className="p-2">566</td>
                      <td className="p-2 font-semibold text-slate-900">{student.course}</td>
                      <td className="p-2">Course Fees</td>
                      <td className="p-2">{paymentDateFormatted}</td>
                      <td className="p-2 text-right">{Number(receipt.amountReceived || 0).toLocaleString("en-IN")}</td>
                      <td className="p-2 text-right font-bold text-emerald-700">{Number(receipt.amountReceived || 0).toLocaleString("en-IN")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Installment Payments Schedule Table */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1">
                Installment Payments
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="bg-slate-200/80 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-2">Due Date</th>
                      <th className="p-2">Invoice</th>
                      <th className="p-2 text-right">Due Fee</th>
                      <th className="p-2 text-right">Received Fee</th>
                      <th className="p-2 text-right">Balance Fee</th>
                      <th className="p-2">Payment Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    <tr>
                      <td className="p-2">{paymentDateFormatted}</td>
                      <td className="p-2">566</td>
                      <td className="p-2 text-right">{finalFee.toLocaleString("en-IN")}</td>
                      <td className="p-2 text-right font-semibold">{totalPaid.toLocaleString("en-IN")}</td>
                      <td className="p-2 text-right font-semibold text-rose-600">{remainingBalance.toLocaleString("en-IN")}</td>
                      <td className="p-2 text-[10px] text-slate-600 font-mono">
                        {receiptNo} {paymentDateFormatted} {Number(receipt.amountReceived).toLocaleString("en-IN")} {receipt.paymentMode || "Online"}
                      </td>
                    </tr>
                    <tr className="bg-slate-200/90 font-bold text-slate-900 border-t border-slate-300 text-xs">
                      <td className="p-2 text-right" colSpan={2}>TOTALS:</td>
                      <td className="p-2 text-right">{finalFee.toLocaleString("en-IN")}</td>
                      <td className="p-2 text-right text-emerald-700">{totalPaid.toLocaleString("en-IN")}</td>
                      <td className="p-2 text-right text-rose-700">{remainingBalance.toLocaleString("en-IN")}</td>
                      <td className="p-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-[10px] text-slate-600 leading-normal">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider">TERMS & CONDITIONS:</h4>
              {customTerms ? (
                <div className="whitespace-pre-line text-slate-600 font-normal">
                  {customTerms}
                </div>
              ) : (
                <ol className="list-decimal list-inside space-y-1 text-slate-600 font-normal">
                  <li>Payment made through cheque is subject to realization. In case the cheque is returned / dishonored for any reason, handling charges of Rs. 500/- along with the charges by the bank for return of the cheque will be collected from student by the centre. This payment should be made only by cash.</li>
                  <li>The student should strictly adhere to the batch / schedule timings specified by the centre. All breaks must be pre approved in writing and not exceeding 2months continuously.</li>
                  <li>Students joining through any special scheme, Inaugural Discount or any scheme classified as a ‘special scheme’ cannot avail the transfer facility.</li>
                  <li>Keep the receipt safe for your future reference, you need to produce this receipt at the time of collecting the course completion certificate.</li>
                  <li>The student is expected to maintain the dignity, discipline and decorum of the centre.</li>
                  <li>The student should take care of all the property of the Centre with utmost care. Any material losses due to mishandling of equipments by student should be paid by the student.</li>
                  <li>Course fee once paid cannot be refunded after the commencement of the course. However the balance fee could be transferred for another course at Centre.</li>
                  <li>FORCE MAJEURE : Design Gateway/CADD MANTRA accepts no liability for delay or non fulfilment of any term of the contract caused by force majeure or by any industrial dispute, default by any accident, flood, riot. Terrorism or any cause not directly within its control.</li>
                  <li>The course and course combinations are expected to change time to time based on the industry requirements. In case you are taking a break during the course and the course you have registered and paid is not available at the time of rejoining, then you will have to join an alternative program available at that point of time or must upgrade the course by paying additional fee if required for the new combination.</li>
                  <li>The student must complete the course within 12 months from the date of joining for diploma programs or short term courses. for master diploma its 2 years validity. The registration is not valid after time period from the date of course commencement. The centre and the student should have mutual agreement for any such break in writing.</li>
                  <li>Fee if paid in installment,all fee payment must be made as per the fee payment schedule discussed at the time of admission</li>
                </ol>
              )}

              <div className="pt-8 flex justify-end">
                <div className="text-center border-t border-slate-400 pt-1 w-44 text-xs text-slate-700 font-bold">
                  Authorised Signatory
                </div>
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
