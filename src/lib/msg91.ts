export interface FeeReceiptWhatsAppParams {
  studentName?: string | null;
  mobileNumber: string;
  courseName?: string | null;
  amountPaid: number | string;
  paymentDate?: string | null;
  receiptNo?: string | null;
  receiptUrl?: string | null;
}

/**
 * Format date to string without time component (e.g. "21 Jul 2026")
 */
export function formatDateOnly(dateInput?: string | null): string {
  if (!dateInput) {
    return new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // If formatted with comma like "21 Jul 2026, 05:30 am", strip time after comma
  if (dateInput.includes(",")) {
    return dateInput.split(",")[0].trim();
  }

  try {
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  } catch (_) {
    // fallback
  }

  return dateInput.trim();
}

/**
 * Format phone number to international format without leading plus (e.g. 919335913286)
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");

  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("0")) {
    cleaned = `91${cleaned.slice(1)}`;
  } else if (cleaned.length > 12 && cleaned.startsWith("91")) {
    cleaned = cleaned.slice(0, 12);
  }

  return cleaned;
}

/**
 * Dispatch MSG91 WhatsApp Outbound Template Message for Fee Receipt
 */
export async function sendWhatsAppFeeReceipt(params: FeeReceiptWhatsAppParams) {
  try {
    const authKey =
      process.env.MSG91_AUTHKEY || "478610A465a065I869fed7fdP1";
    const integratedNumber =
      process.env.MSG91_INTEGRATED_NUMBER || "919335913286";

    const formattedPhone = formatPhoneNumber(params.mobileNumber);
    if (!formattedPhone) {
      console.warn("MSG91 WhatsApp Warning: Missing or invalid phone number.");
      return { success: false, error: "Invalid recipient phone number." };
    }

    const rNo = params.receiptNo || "GEN-001";
    const appBaseUrl =
      process.env.PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "";
    const receiptDocUrl =
      params.receiptUrl ||
      (appBaseUrl
        ? `${appBaseUrl.replace(/\/$/, "")}/api/receipts/${rNo}/pdf`
        : process.env.MSG91_DEFAULT_PDF_URL ||
          "https://pdfobject.com/pdf/sample-3pp.pdf");
    const filename = `Fee_Receipt_${rNo}.pdf`;
    const formattedAmount = `₹${Number(params.amountPaid || 0).toLocaleString(
      "en-IN",
      { minimumFractionDigits: 2 }
    )}`;

    const payload = {
      integrated_number: integratedNumber,
      content_type: "template",
      payload: {
        messaging_product: "whatsapp",
        type: "template",
        template: {
          name: "fee",
          language: {
            code: "en",
            policy: "deterministic",
          },
          namespace: null,
          to_and_components: [
            {
              to: [formattedPhone],
              components: {
                header_1: {
                  filename: filename,
                  type: "document",
                  value: receiptDocUrl,
                },
                body_1: {
                  type: "text",
                  value: params.studentName || "Student",
                },
                body_2: {
                  type: "text",
                  value: params.courseName || "Course",
                },
                body_3: {
                  type: "text",
                  value: formattedAmount,
                },
                body_4: {
                  type: "text",
                  value: formatDateOnly(params.paymentDate),
                },
              },
            },
          ],
        },
      },
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authKey) {
      headers["authkey"] = authKey;
    }

    console.log(
      `MSG91 WhatsApp Sending to ${formattedPhone} for Receipt ${params.receiptNo}...`
    );

    const response = await fetch(
      "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }
    );

    const resText = await response.text();
    let resJson: any = null;
    try {
      resJson = JSON.parse(resText);
    } catch (_) {
      // API returned raw text
    }

    console.log("MSG91 WhatsApp Response:", resText);

    if (response.ok) {
      return {
        success: true,
        data: resJson || resText,
      };
    } else {
      return {
        success: false,
        error: resJson?.message || resText || "Failed to send WhatsApp message.",
      };
    }
  } catch (error: any) {
    console.error("MSG91 WhatsApp Error:", error);
    return {
      success: false,
      error: error.message || "Network error during MSG91 WhatsApp trigger.",
    };
  }
}
