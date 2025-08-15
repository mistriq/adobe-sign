const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const API_BASE = 'https://api.eu1.adobesign.com/api/rest/v6';
const ACCESS_TOKEN = process.env.ADOBE_ACCESS_TOKEN;
const TEMPLATE_ID = process.env.ADOBE_TEMPLATE_ID;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

app.post('/createAgreement', async (req, res) => {
  try {
    const { name, email } = req.body;

    const agreementRes = await fetch(`${API_BASE}/agreements`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileInfos: [{ libraryDocumentId: TEMPLATE_ID }],
        name: `Agreement for ${name}`,
        participantSetsInfo: [{
          memberInfos: [{
            email: email
          }],
          order: 1,
          role: 'SIGNER'
        }],
        mergeFieldInfo: [
          { fieldName: 'name', defaultValue: name },
          { fieldName: 'email', defaultValue: email }
        ],
        signatureType: 'ESIGN',
        state: 'DRAFT',
        postSignRedirectUrl: `${BASE_URL}/success`,
      })
    });

    const agreementData = await agreementRes.json();
    const agreementId = agreementData.id;

    // Send the agreement (transition from DRAFT to IN_PROCESS)
    const sendRes = await fetch(`${API_BASE}/agreements/${agreementId}/state`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        state: 'IN_PROCESS'
      })
    });

    // Adobe API may return empty response for state changes
    let sendData = {};
    try {
      const responseText = await sendRes.text();
      if (responseText) {
        sendData = JSON.parse(responseText);
      }
    } catch (e) {
      // Expected for successful state changes
    }

    // Wait for Adobe to process the agreement - maybe not needed, but just in case
    await new Promise(resolve => setTimeout(resolve, 3000));

    const urlRes = await fetch(`${API_BASE}/agreements/${agreementId}/signingUrls`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
    });

    const urlData = await urlRes.json();
    
    if (urlData.code === 'AGREEMENT_NOT_EXPOSED') {
        return res.status(500).json({ error: 'Agreement is not ready for signing yet. Please try again in a moment.' });
    }
    
    if (!urlData.signingUrlSetInfos || urlData.signingUrlSetInfos.length === 0 || !urlData.signingUrlSetInfos[0].signingUrls) {
        return res.status(500).json({ error: 'No signing URLs were generated' });
    }

    const signingUrl = urlData.signingUrlSetInfos[0].signingUrls[0].esignUrl;
    
    if (!signingUrl) {
        return res.status(500).json({ error: 'Failed to get signing URL' });
    }
    
    res.json({ signingUrl, agreementId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating agreement' });
  }
});

app.get('/sign.html', (req, res) => {
  res.sendFile(__dirname + '/public/sign.html');
});

app.get('/checkAgreementStatus/:agreementId', async (req, res) => {
  try {
    const { agreementId } = req.params;
    
    const statusRes = await fetch(`${API_BASE}/agreements/${agreementId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
    });
    
    const agreementData = await statusRes.json();
    
    res.json({ 
      status: agreementData.status,
      isSigned: agreementData.status === 'SIGNED'
    });
    
  } catch (error) {
    console.error('Error checking agreement status:', error);
    res.status(500).json({ error: 'Error checking agreement status' });
  }
});


app.get('/success', (req, res) => {
  res.sendFile(__dirname + '/public/success.html');
});

app.listen(3000, () => console.log(`Server running on ${BASE_URL}`));