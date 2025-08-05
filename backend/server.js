const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const request = require('request');
const axios = require('axios');
const xml2js = require('xml2js'); // For parsing SOAP XML
const fastXmlParser = require('fast-xml-parser');
const { XMLParser } = require('fast-xml-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ==========================
// ✅ SAP Config
// ==========================
const PORT = 8080;
const SAP_LOGIN_URL        = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zser_cu_login_pr?sap-client=100';
const SAP_PROFILE_URL      = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zser_cu_profile_pr?sap-client=100';
const SAP_DASH_URL         = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zser_cu_dash_pr?sap-client=100';
const SAP_SALES_DASH_URL   = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zser_cu_sales_dash_pr?sap-client=100';
const SAP_LIST_DASH_URL    = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zser_cu_list_dash_pr?sap-client=100';
const SAP_INVOICE_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zser_cu_fin_invoice_pr?sap-client=100';
const SAP_PAYMENT_AGING_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zser_cu_paymentaging_fin_pr?sap-client=100';
const SAP_CREDITDEBIT_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zser_cu_creditdebit_fin_pr?sap-client=100';
const SAP_INVOICE_FORM_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zser_cu_invoiceforms_pr?sap-client=100';
const SAP_OVERALL_SALES_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zser_cu_overallsales_fin_pr?sap-client=100';





const SAP_USER = 'K901673';        // Replace with actual SAP username
const SAP_PASS = 'Tpraburam733@'; // Replace with actual SAP password

// ==========================
// ✅ SOAP XML Builders
// ==========================
function buildLoginXML(customerId, password) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <n0:ZfmCuLoginPr>
         <CustomerId>${customerId}</CustomerId>
         <Password>${password}</Password>
      </n0:ZfmCuLoginPr>
   </soapenv:Body>
</soapenv:Envelope>`;
}

function buildProfileXML(customerId) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <n0:ZfmCuProfilePr>
         <CustomerId>${customerId}</CustomerId>
      </n0:ZfmCuProfilePr>
   </soapenv:Body>
</soapenv:Envelope>`;
}

function buildDashboardXML(customerId) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <n0:ZfmCuDashPr>
         <IvCustomerId>${customerId}</IvCustomerId>
      </n0:ZfmCuDashPr>
   </soapenv:Body>
</soapenv:Envelope>`;
}

function buildSalesDashXML(customerId) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <n0:ZfmCuSalesDashPr>
         <IvCustomerId>${customerId}</IvCustomerId>
      </n0:ZfmCuSalesDashPr>
   </soapenv:Body>
</soapenv:Envelope>`;
}

function buildListDashXML(customerId) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <n0:ZfmCuListDashPr>
         <IvCustomerId>${customerId}</IvCustomerId>
      </n0:ZfmCuListDashPr>
   </soapenv:Body>
</soapenv:Envelope>`;
}

function buildInvoiceXML(customerId) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <n0:ZfmCuFinInvoicePr>
         <ICustomer>${customerId}</ICustomer>
      </n0:ZfmCuFinInvoicePr>
   </soapenv:Body>
</soapenv:Envelope>`;
}

function buildPaymentAgingXML(customerId) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <n0:ZfmCuPaymentsagingFinPr>
         <IvKunnr>${customerId}</IvKunnr>
      </n0:ZfmCuPaymentsagingFinPr>
   </soapenv:Body>
</soapenv:Envelope>`;
}

function buildCreditDebitXML(customerId) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <n0:ZfmCuCreditdebitFinPr>
         <IvKunnr>${customerId}</IvKunnr>
      </n0:ZfmCuCreditdebitFinPr>
   </soapenv:Body>
</soapenv:Envelope>`;
}

function buildInvoiceFormXML(customerId, docNo) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
   <soapenv:Header/>
   <soapenv:Body>
      <n0:ZfmCuInvoiceformsPr>
         <PCustId>${customerId}</PCustId>
         <PDocNo>${docNo}</PDocNo>
      </n0:ZfmCuInvoiceformsPr>
   </soapenv:Body>
</soapenv:Envelope>`;
}

function buildOverallSalesXML(customerId) {
  return `<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
  <soap-env:Body>
    <n0:ZfmCuOverallsalesFinPr xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
      <IvKunnr>${customerId}</IvKunnr>
    </n0:ZfmCuOverallsalesFinPr>
  </soap-env:Body>
</soap-env:Envelope>`;
}






// ==========================
// ✅ Helper: Call SAP SOAP Service
// ==========================
async function callSAP(url, xmlBody) {
  return axios.post(url, xmlBody, {
    headers: {
      'Content-Type': 'text/xml;charset=UTF-8',
      'SOAPAction': '""'
    },
    auth: { username: SAP_USER, password: SAP_PASS }
  });
}

// ==========================
// ✅ Improved Generic XML Parser (Namespace Safe)
// ==========================
function safeParseSAP(xmlData, tableKeyOptions) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xmlData, { explicitArray: false }, (err, result) => {
      if (err) return reject(err);

      // ✅ 1. Find Envelope dynamically
      const envelopeKey = Object.keys(result).find(k => k.includes('Envelope'));
      const envelope = result[envelopeKey];
      if (!envelope) return reject(new Error('No SOAP Envelope found'));

      // ✅ 2. Find Body dynamically
      const bodyKey = Object.keys(envelope).find(k => k.includes('Body'));
      const body = envelope[bodyKey];
      if (!body) return reject(new Error('No SOAP Body found'));

      // ✅ 3. Find Response Node dynamically
      const respKey = Object.keys(body).find(k => k.includes('Response'));
      const responseNode = body[respKey];
      if (!responseNode) return reject(new Error('No SAP Response Node found'));

      // ✅ 4. Find the correct SAP table node
      let dataTable;
      for (const key of tableKeyOptions) {
        if (responseNode[key]) {
          dataTable = responseNode[key].item;
          break;
        }
      }

      if (!dataTable) return resolve([]);
      const items = Array.isArray(dataTable) ? dataTable : [dataTable];

      // ✅ 5. Normalize expected fields
      const formatted = items.map(row => ({
        VBELN: row.VBELN || row.Vbeln || '',
        ERDAT: row.ERDAT || row.Erdat || '',
        MATNR: row.MATNR || row.Matnr || '',
        ARKTX: row.ARKTX || row.Arktx || '',
        LFIMG: row.LFIMG || row.Lfimg || '',
        MEINS: row.MEINS || row.Meins || '',
        WAERK: row.WAERK || row.Waerk || '',
        VRKME: row.VRKME || row.Vrkme || '',
        KWMENG: row.KWMENG || row.Kwmeng || '',
        NETWR: row.NETWR || row.Netwr || ''
      }));

      resolve(formatted);
    });
  });
}

// ==========================
// ✅ LOGIN API
// ==========================
app.post('/api/login', async (req, res) => {
  const { customerId, password } = req.body;
  if (!customerId || !password) return res.status(400).json({ error: 'Missing customerId or password' });

  try {
    const soapXML = buildLoginXML(customerId, password);
    const response = await callSAP(SAP_LOGIN_URL, soapXML);

    console.log('✅ SAP Login Response:', response.data);
    res.send(response.data);

  } catch (err) {
    console.error('❌ SAP Login Error:', err.message);
    if (err.response) console.error('❌ SAP Fault:', err.response.data);
    res.status(500).json({ error: 'SAP login failed', details: err.message });
  }
});

// ==========================
// ✅ PROFILE API
// ==========================
app.post('/api/profile', async (req, res) => {
  const { customerId } = req.body;
  if (!customerId) return res.status(400).json({ error: 'Missing customerId' });

  try {
    const soapXML = buildProfileXML(customerId);
    const response = await callSAP(SAP_PROFILE_URL, soapXML);

    console.log('✅ SAP Profile Response:', response.data);
    res.send(response.data);

  } catch (err) {
    console.error('❌ SAP Profile Error:', err.message);
    if (err.response) console.error('❌ SAP Fault:', err.response.data);
    res.status(500).json({ error: 'SAP profile fetch failed', details: err.message });
  }
});

// ==========================
// ✅ NORMAL DASHBOARD API
// ==========================
app.post('/api/dashboard', async (req, res) => {
  const { customerId } = req.body;
  if (!customerId) return res.status(400).json({ error: 'Missing customerId' });

  try {
    const soapXML = buildDashboardXML(customerId);
    const response = await callSAP(SAP_DASH_URL, soapXML);

    console.log('✅ SAP Dashboard Raw XML:', response.data);

    const parsedData = await safeParseSAP(response.data, [
      'EtInquiryData',
      'ET_DASHBOARD'
    ]);

    res.json({ customerId, dashboard: parsedData });

  } catch (err) {
    console.error('❌ SAP Dashboard Error:', err.message);
    if (err.response) console.error('❌ SAP Fault:', err.response.data);
    res.status(500).json({ error: 'SAP dashboard fetch failed', details: err.message });
  }
});

// ==========================
// ✅ SALES DASHBOARD API
// ==========================
app.post('/api/sales-dashboard', async (req, res) => {
  const { customerId } = req.body;
  if (!customerId) return res.status(400).json({ error: 'Missing customerId' });

  try {
    const soapXML = buildSalesDashXML(customerId);
    const response = await callSAP(SAP_SALES_DASH_URL, soapXML);

    console.log('✅ SAP Sales Dashboard Raw XML:', response.data);

    const parsedData = await safeParseSAP(response.data, [
      'EtSales',
      'ET_SALES_DATA',
      'EtSalesData'
    ]);

    res.json({ customerId, salesDashboard: parsedData });

  } catch (err) {
    console.error('❌ SAP Sales Dashboard Error:', err.message);
    if (err.response) console.error('❌ SAP Fault:', err.response.data);
    res.status(500).json({ error: 'SAP sales dashboard fetch failed', details: err.message });
  }
});

// ==========================
// ✅ LIST DASHBOARD API
// ==========================
app.post('/api/list-dashboard', async (req, res) => {
  const { customerId } = req.body;
  if (!customerId) return res.status(400).json({ error: 'Missing customerId' });

  try {
    const soapXML = buildListDashXML(customerId);
    const response = await callSAP(SAP_LIST_DASH_URL, soapXML);

    console.log('✅ SAP List Dashboard Raw XML:\n', response.data);

    const parsedData = await safeParseSAP(response.data, [
      'EtDeliveries',        // ✅ Your actual SAP structure name
      'ET_DELIVERIES',
      'ZlistData',     // ✅ Add if your SAP response sends something else
      'List',
    ]);

    res.json({ customerId, listDashboard: parsedData});

  } catch (err) {
    console.error('❌ SAP List Dashboard Error:', err.message);
    if (err.response) console.error('❌ SAP Fault:', err.response.data);
    res.status(500).json({ error: 'SAP list dashboard fetch failed', details: err.message });
  }
});

//FINANCE INVOICE
app.post('/api/invoice-dashboard', async (req, res) => {
  const { customerId } = req.body;
  if (!customerId) return res.status(400).json({ error: 'Missing customerId' });

  try {
    const soapXML = buildInvoiceXML(customerId);
    const response = await callSAP(SAP_INVOICE_URL, soapXML);

    console.log('✅ SAP Invoice Dashboard Raw XML:\n', response.data);

    const parsedData = await safeParseSAP(response.data, [
      'E_INVOICES',
      'EInvoices',
      'ET_INVOICES'
    ]);

    res.json({ customerId, invoiceDashboard: parsedData });

  } catch (err) {
    console.error('❌ SAP Invoice Dashboard Error:', err.message);
    if (err.response) console.error('❌ SAP Fault:', err.response.data);
    res.status(500).json({ error: 'SAP invoice fetch failed', details: err.message });
  }
});

// ==========================
// ✅ PAYMENT AGING API
// ==========================
app.post('/api/payment-aging', async (req, res) => {
  const { customerId } = req.body;
  if (!customerId) return res.status(400).json({ error: 'Missing customerId' });

  try {
    const soapXML = buildPaymentAgingXML(customerId);
    const response = await callSAP(SAP_PAYMENT_AGING_URL, soapXML);

    console.log('✅ SAP Payment Aging Raw XML:\n', response.data);

    const parsedData = await safeParseSAP(response.data, [
      'ET_AGING', 'EtAging', 'AgingData'
    ]);

    res.json({ customerId, paymentAging: parsedData });

  } catch (err) {
    console.error('❌ SAP Payment Aging Error:', err.message);
    if (err.response) console.error('❌ SAP Fault:', err.response.data);
    res.status(500).json({ error: 'SAP payment aging fetch failed', details: err.message });
  }
});


//Credit Debit memo
app.post('/api/credit-debit', async (req, res) => {
  const { customerId } = req.body;
  if (!customerId) return res.status(400).json({ error: 'Missing customerId' });

  try {
    const soapXML = buildCreditDebitXML(customerId);
    const response = await callSAP(SAP_CREDITDEBIT_URL, soapXML);

    console.log('✅ SAP Credit/Debit Raw XML:', response.data);

    const parsedData = await safeParseSAP(response.data, [
      'ET_MEMO', 'ET_CREDITDEBIT','EtMemo'
    ]);

    res.json({ customerId, creditDebitData: parsedData });

  } catch (err) {
    console.error('❌ SAP Credit/Debit Error:', err.message);
    if (err.response) console.error('❌ SAP Fault:', err.response.data);
    res.status(500).json({ error: 'SAP credit/debit fetch failed', details: err.message });
  }
});

//INVOICE FORMS
// app.post('/api/invoice-forms', async (req, res) => {
//   const { customerId, docNo } = req.body;
//   if (!customerId || !docNo) {
//     return res.status(400).json({ error: 'Missing customerId or docNo' });
//   }

//   try {
//     const soapXML = buildInvoiceFormXML(customerId, docNo);
//     const response = await callSAP(SAP_INVOICE_FORM_URL, soapXML);

//     console.log('✅ SAP Invoice Forms Raw XML:', response.data);

//     const parsedData = await safeParseSAP(response.data, [
//       'P_Pdf', 'PPdf', 'PDF_BINARY' // ← Adjust this based on your actual response export name
//     ]);

//     res.json({ customerId, docNo, invoiceData: parsedData });

//   } catch (err) {
//     console.error('❌ SAP Invoice Forms Error:', err.message);
//     if (err.response) console.error('❌ SAP Fault:', err.response.data);
//     res.status(500).json({ error: 'SAP invoice forms fetch failed', details: err.message });
//   }
// });

app.post('/api/invoice-pdf', async (req, res) => {
  const { customerId, docNo } = req.body;
  if (!customerId || !docNo) {
    return res.status(400).json({ error: 'Missing customerId or docNo' });
  }

  try {
    const soapXML = buildInvoiceFormXML(customerId, docNo);
    const response = await callSAP(SAP_INVOICE_FORM_URL, soapXML);
    console.log('SAP Response:', response.data);

    // ✅ Extract <PPdf> content manually
    const match = response.data.match(/<PPdf>([\s\S]*?)<\/PPdf>/);
    if (!match) {
      throw new Error('No PDF data found in SAP response');
    }
    //const base64PDF = match[1].trim();
let base64PDF = match[1]
  .replace(/\s+/g, '')       // remove all whitespaces, line breaks
  .replace(/&#xA;/g, '')     // remove encoded line breaks if present
  .replace(/&#.*?;/g, '');   // remove any other HTML entities

    const pdfBuffer = Buffer.from(base64PDF, 'base64');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="invoice.pdf"',
    });
    res.send(pdfBuffer);

  } catch (err) {
    console.error('❌ Invoice PDF Error:', err.message);
    res.status(500).json({ error: 'Failed to generate PDF', details: err.message });
  }
});

 //overall sales
app.post('/api/overall-sales', async (req, res) => {
  const { customerId } = req.body;
  if (!customerId) return res.status(400).json({ error: 'Missing customerId' });

  try {
    const soapXML = buildOverallSalesXML(customerId);
    const response = await callSAP(SAP_OVERALL_SALES_URL, soapXML);

    console.log('✅ SAP Overall Sales Raw XML:', response.data);

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      parseTagValue: true,
      trimValues: true
    });

    const parsed = parser.parse(response.data);

    const items =
      parsed['soap-env:Envelope']?.['soap-env:Body']?.['n0:ZfmCuOverallsalesFinPrResponse']?.EtSalesSummary?.item;

    const overallSales = Array.isArray(items) ? items : items ? [items] : [];

    res.json({ customerId, overallSales });

  } catch (err) {
    console.error('❌ SAP Overall Sales Error:', err.message);
    if (err.response) console.error('❌ SAP Fault:', err.response.data);
    res.status(500).json({ error: 'SAP overall sales fetch failed', details: err.message });
  }
});






// ==========================
// ✅ Start backend
// ==========================
app.listen(PORT, () => console.log("✅ Backend running at http://localhost:${`PORT`}"));