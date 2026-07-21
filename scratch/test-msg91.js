const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) envVars[k.trim()] = v.trim();
});

async function testMsg91() {
  const authKey = envVars.MSG91_AUTHKEY || "478610A465a065I869fed7fdP1";
  const integratedNumber = envVars.MSG91_INTEGRATED_NUMBER || "919335913286";
  const publicAppUrl = envVars.PUBLIC_APP_URL || "https://uncounted-boxing-neurology.ngrok-free.dev";

  const pdfUrl = `${publicAppUrl}/api/receipts/REC-2026-00014/pdf`;

  console.log("Using AuthKey:", authKey);
  console.log("Using Integrated Number:", integratedNumber);
  console.log("Using Ngrok Receipt PDF URL:", pdfUrl);

  const payload = {
    "integrated_number": integratedNumber,
    "content_type": "template",
    "payload": {
        "messaging_product": "whatsapp",
        "type": "template",
        "template": {
            "name": "fee",
            "language": {
                "code": "en",
                "policy": "deterministic"
            },
            "namespace": null,
            "to_and_components": [
                {
                    "to": [
                        "919335913286"
                    ],
                    "components": {
                        "header_1": {
                            "filename": "Fee_Receipt_REC-2026-00014.pdf",
                            "type": "document",
                            "value": pdfUrl
                        },
                        "body_1": {
                            "type": "text",
                            "value": "Abhigyan Mishra"
                        },
                        "body_2": {
                            "type": "text",
                            "value": "Python"
                        },
                        "body_3": {
                            "type": "text",
                            "value": "₹5,000.00"
                        },
                        "body_4": {
                            "type": "text",
                            "value": "21 Jul 2026"
                        }
                    }
                }
            ]
        }
    }
  };

  const response = await fetch("https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "authkey": authKey
    },
    body: JSON.stringify(payload)
  });

  const status = response.status;
  const text = await response.text();

  console.log("HTTP Status Code:", status);
  console.log("MSG91 Response Body:", text);
}

testMsg91().catch(console.error);
