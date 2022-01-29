//Custom element for each department's data display on the summary screen.

//Base HTML for this component
const template = document.createElement('template');
template.innerHTML = `
<div id="dept-container">
    <div id="header">
        <h2 />
    </div>
    <div id="below-header">
        <div id="base-stats">
            <div id="total"><p>Total Machines</p><p class="value" /></div>
            <div id="win"><p>Total Windows</p><p class="value" /></div>
            <div id="mac"><p>Total Mac</p><p class="value" /></div>
            <div id="lin"><p>Total Linux</p><p class="value" /></div>
            <div id="ad"><p>Total in AD</p><p class="value" /></div>
            <div id="ad-pvs"><p>AD without PVS</p><p class="value" /></div>
            <div id="pvs"><p>Total with PVS</p><p class="value" /></div>
            <div id="printers"><p>Total Printers</p><p class="value" /></div>
            <div id="fe"><p>Total with Fireeye</p><p class="value" /></div>
            <div id="fe-ad"><p>Total Fireye + AD</p><p class="value" /></div>
            <div id="ninite"><p>Percent Windows + Ninite</p><p class="value" /></div>
            <div id="jamf"><p>Percent Mac + JAMF</p><p class="value" /></div>
        </div>
        <div id="plot-container">
            <div id="os-chart"></div>
            <div id="fireeye-chart"></div>
            <div id="fireeyeAD-chart"></div>
        </div>
    </div>
</div>
`;

//link the stylesheet
const linkElement = document.createElement('link');
linkElement.setAttribute('rel', 'stylesheet');
linkElement.setAttribute('href', './pages/summary/dept.css');


//Attributes: name, total, win, mac, linux, ad, ad-pvs, pvs, printers, fe-ad, fe, p-fe-ad, p-fe-mw, p-ninite, p-jamf

//This class has the logic for the custom html element
export class DeptComponent extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(linkElement);
        this.shadowRoot.querySelector('h2').innerText = this.getAttribute('name');
        this.stats = this.shadowRoot.querySelector('#base-stats');
    }
    connectedCallback(){
        this.createStats();
        this.createCharts();
    }
    createStats(){
        this.shadowRoot.querySelector('#total .value').innerText = this.getAttribute('total');
        this.shadowRoot.querySelector('#win .value').innerText = this.getAttribute('win');
        this.shadowRoot.querySelector('#mac .value').innerText = this.getAttribute('mac');
        this.shadowRoot.querySelector('#lin .value').innerText = this.getAttribute('linux');
        this.shadowRoot.querySelector('#ad .value').innerText = this.getAttribute('ad');
        this.shadowRoot.querySelector('#ad-pvs .value').innerText = this.getAttribute('ad-pvs');
        this.shadowRoot.querySelector('#pvs .value').innerText = this.getAttribute('pvs');
        this.shadowRoot.querySelector('#printers .value').innerText = this.getAttribute('printers');
        this.shadowRoot.querySelector('#fe .value').innerText = this.getAttribute('fe');
        this.shadowRoot.querySelector('#fe-ad .value').innerText = this.getAttribute('fe-ad');
        this.shadowRoot.querySelector('#ninite .value').innerText = this.getAttribute('p-ninite');
        this.shadowRoot.querySelector('#jamf .value').innerText = this.getAttribute('p-jamf');
    }

    createCharts(){
        anychart.onDocumentReady(() => {
            var dataOSChart = [
                {x: "Windows", value: parseInt(this.getAttribute('win')), normal: {fill: "crimson"}, hovered: {fill: "lightcoral"}},
                {x: "Linux", value: parseInt(this.getAttribute('linux')), normal: {fill: "darkgray"}, hovered: {fill: "lightgray"}},
                {x: "Mac", value: parseInt(this.getAttribute('mac')), normal: {fill: "yellow"}, hovered: {fill: "rgb(247, 255, 135)"}}
            ];

            const dFireeyeConverted = parseInt(this.getAttribute('p-fe-mw').substring(0, this.getAttribute('p-fe-mw').length - 1));
            var dataFireeye = [
                {x: "Fireeye Windows + Mac", value: dFireeyeConverted, normal: {fill: "crimson"}, hovered: {fill: "lightcoral"}},
                {x: "Not Fireeye Windows + Mac", value: 100 - dFireeyeConverted, normal: {fill: "yellow"}, hovered: {fill: "rgb(247, 255, 135)"}}
            ];

            const dFireeyeADConverted = parseInt(this.getAttribute('p-fe-ad').substring(0, this.getAttribute('p-fe-ad').length - 1));
            var dataFireeyeAD = [
                {x: "Fireeye AD", value: dFireeyeADConverted, normal: {fill: "crimson"}, hovered: {fill: "lightcoral"}},
                {x: "Not Fireeye AD", value: 100 - dFireeyeADConverted, normal: {fill: "yellow"}, hovered: {fill: "rgb(247, 255, 135)"}}
            ];

            //create charts
            var osChart = anychart.pie();
            var fireeyeChart = anychart.pie();
            var fireeyeADChart = anychart.pie();

            //set titles
            osChart.title("Operating System");
            fireeyeChart.title("Percent Fireeye Windows + Mac");
            fireeyeADChart.title("Percent Fireeye + AD")

            //set data
            osChart.data(dataOSChart);
            fireeyeChart.data(dataFireeye);
            fireeyeADChart.data(dataFireeyeAD);

            //set background colors
            osChart.background().fill("blanchedalmond");
            fireeyeChart.background().fill("blanchedalmond");
            fireeyeADChart.background().fill("blanchedalmond");

            //set font colors
            osChart.title().fontColor("black");
            fireeyeChart.title().fontColor("black");
            fireeyeADChart.title().fontColor("black");

            osChart.legend().fontColor("black");
            fireeyeChart.legend().fontColor("black");
            fireeyeADChart.legend().fontColor("black");

            //display charts
            osChart.container(this.shadowRoot.querySelector('#os-chart'));
            fireeyeChart.container(this.shadowRoot.querySelector('#fireeye-chart'));
            fireeyeADChart.container(this.shadowRoot.querySelector('#fireeyeAD-chart'));
            osChart.draw();
            fireeyeChart.draw();
            fireeyeADChart.draw();
        });
    }
}