import { SummaryComponent } from './pages/summary/summary.js';
import { MainComponent } from './pages/main/main.js';
import { ADComponent } from './pages/ad/ad.js';
import { DHCPComponent } from './pages/dhcp/dhcp.js';
import { DeptComponent } from "./pages/summary/dept.js";
import { AllComponent } from "./pages/summary/all.js";
import { ArchiveComponent } from "./pages/summary/archive.js";
import appData from './api/frontendData.js';

//Find all the necessary elements
const content = document.querySelector('.content');
const sumButton = document.getElementById('summary');
const mainButton = document.getElementById('main');
const adButton = document.getElementById('ad');
const dhcpButton = document.getElementById('dhcp');
const navAnimation = document.querySelector('#animation');

//Define custom elements
window.customElements.define('summary-component', SummaryComponent);
window.customElements.define('main-component', MainComponent);
window.customElements.define('ad-component', ADComponent);
window.customElements.define('dhcp-component', DHCPComponent);
window.customElements.define('dept-component', DeptComponent);
window.customElements.define('all-component', AllComponent);
window.customElements.define('archive-component', ArchiveComponent);

//Enum to set all the pages
const pages = {
    SUMMARY: 'summary',
    MAIN: 'main',
    AD: 'ad',
    DHCP: 'dhcp'
};

//Default page is SUMMARY
var currentpage = pages.SUMMARY;

//Loading until the appData class has a data value
content.innerHTML = `
<div id="loading-screen">
    <img src="./images/logo.png" alt="Maryland Logo">
</div>
`
window.api.sendData("sendData", (data) => {
    //console.log(`Received ${data} from main process`);
    appData.setData(data);
    setListeners();
    setPage();
});
window.api.getData("getData", "");


//Function that sets the content of the content div to display the correct info based on the value of currentpage
function setPage(){
    //console.log('set page');
    
    switch(currentpage){
        case pages.SUMMARY:
            content.innerHTML = `<summary-component />`;
            break;
        case pages.MAIN:
            content.innerHTML = `<main-component />`;
            break;
        case pages.AD:
            content.innerHTML = `<ad-component />`;
            break;
        case pages.DHCP:
            content.innerHTML = `<dhcp-component />`;
            break;
    }
}

//Add all event listeners that will change the page if the value of current page changes
function setListeners(){
    sumButton.addEventListener('click', () => {
        if(currentpage !== pages.SUMMARY){
            currentpage = pages.SUMMARY;
            navAnimation.className = 'summary';
            setPage();
        }
    });
    mainButton.addEventListener('click', () => {
        if(currentpage !== pages.MAIN){
            currentpage = pages.MAIN;
            navAnimation.className = 'main';
            setPage();
        }
    });
    adButton.addEventListener('click', () => {
        if(currentpage !== pages.AD){
            currentpage = pages.AD;
            navAnimation.className = 'ad';
            setPage();
        }
    });
    dhcpButton.addEventListener('click', () => {
        if(currentpage !== pages.DHCP){
            currentpage = pages.DHCP;
            navAnimation.className = 'dhcp';
            setPage();
        }
    });
}