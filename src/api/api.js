//This file is responsible for calling to the google sheets API

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const keys = require('../../keys.json');

const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
);

async function getSummaryData(cl){
    const gsapi = google.sheets({
        version:'v4',
        auth: cl
    });

    const opt = {
        spreadsheetId: '1UUSB-Emunk8zrxurBZ7cYS7g3nA-r4thr7SNofGiZDg',
        range: 'Summary!B2:Q17'
    };

    let data = await gsapi.spreadsheets.values.get(opt);
    return data.data.values;
}

async function getDHCPData(cl){
    const gsapi = google.sheets({
        version:'v4',
        auth: cl
    });

    const opt = {
        spreadsheetId: '1UUSB-Emunk8zrxurBZ7cYS7g3nA-r4thr7SNofGiZDg',
        range: 'DHCPIP02162021!A2:M12702'
    };

    let data = await gsapi.spreadsheets.values.get(opt);
    return data.data.values;
}

async function getADData(cl){
    const gsapi = google.sheets({
        version:'v4',
        auth: cl
    });

    const opt = {
        spreadsheetId: '1UUSB-Emunk8zrxurBZ7cYS7g3nA-r4thr7SNofGiZDg',
        range: 'AD04272021!A2:O2524'
    };

    let data = await gsapi.spreadsheets.values.get(opt);
    return data.data.values;
}

async function getMainData(cl){
    const gsapi = google.sheets({
        version:'v4',
        auth: cl
    });

    const opt = {
        spreadsheetId: '1UUSB-Emunk8zrxurBZ7cYS7g3nA-r4thr7SNofGiZDg',
        range: 'Main!A2:Z4405'
    };

    let data = await gsapi.spreadsheets.values.get(opt);
    return data.data.values;
}

async function getArchiveData(cl){
    const gsapi = google.sheets({
        version:'v4',
        auth: cl
    });

    const opt = {
        spreadsheetId: '1UUSB-Emunk8zrxurBZ7cYS7g3nA-r4thr7SNofGiZDg',
        range: 'MainArchive!A2:U4459'
    };

    let data = await gsapi.spreadsheets.values.get(opt);
    return data.data.values;
}

module.exports = {
    GetData: async function getData(){
        client.authorize((err, tokens) => {
            if(err){
                console.log(err);
                return;
            }

            //console.log('connected');  
        });
        const sumData = await getSummaryData(client);
        const mainData = await getMainData(client);
        const adData = await getADData(client);
        const dhcpData = await getDHCPData(client);
        const archiveData = await getArchiveData(client);
        return {
            Summary: sumData,
            Main: mainData,
            AD: adData,
            DHCP: dhcpData,
            Archive: archiveData
        };
    },

    SendChange: async function sendChange(rangeProvided, row){
        client.authorize((err, tokens) => {
            if(err){
                console.log(err);
                return;
            }

            //console.log('sending');  
        });

        const gsapi = google.sheets({
            version:'v4',
            auth: client
        });

        const opt = {
            spreadsheetId: '1UUSB-Emunk8zrxurBZ7cYS7g3nA-r4thr7SNofGiZDg',
            range: rangeProvided,
            valueInputOption: 'USER_ENTERED',
            resource: { values: [row] }
        };
        var res = await gsapi.spreadsheets.values.update(opt);
        return res.status;
    }
};   