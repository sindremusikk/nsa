const fs = require('fs');
const fetch = require('node-fetch')
const ejs = require('ejs')

//https://docs.google.com/spreadsheets/d/e/2PACX-1vQPUJx_XkBwdldi58FIIQdsNbRigmI7B7qbk9mmPeN0hyQ-dsFY23KRlpjhpHxnV4_QKzcGbGdwuxgl/pubhtml

async function fetchRawData() {
    const url = "https://spreadsheets.google.com/feeds/list/1AChhlsTROHI5fDE7ELmSTJdLZ_fy36leu7vk6OqbrrE/1/public/values?alt=json";

    const response = await fetch(url);
    const json = await response.json();

    let data = [];

    for (const row of json.feed.entry) {
        const formattedRow = {}

        for (const key in row) {
            if (key.startsWith("gsx$")) {

                formattedRow[key.replace("gsx$", "")] = row[key].$t

            }
        }

        data.push(formattedRow)
    }

    return data;

}

async function generate() {

    const data = await fetchRawData()

    let tableRows = "";
    for (const item of data) {
        let row = "<tr>";
        for (const [key, value] of Object.entries(item)) {
            row += `<td>${value}</td>`
        }
        tableRows += `${row}</tr>\r\n`
    }


    const mainTableModel = {
        content: tableRows
    }
    const html = await ejs.renderFile('index.ejs', { mainTable: mainTableModel }).then((output) => output)

    fs.writeFileSync('./docs/index.html', html)

}

generate();
