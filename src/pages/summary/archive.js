import appData from "../../api/frontendData.js";
//Custom element for the all section's data display on the summary screen.

//Base HTML for this component
const template = document.createElement('template');
template.innerHTML = `
<div id="archive-container">
    <div id="header">
        <h2>Main Archive vs. Current Main</h2>
    </div>
    <div id="content">
        <div id="base-stats">
            <div><p class="top left empty" /> <p class="top">Main Archive</p> <p class="top">Current Main</p></div>
            <div id="total"><p class="left">Total Machines</p><p class="archivevalue" /><p class="mainvalue" /></div>
            <div id="win"><p class="left">Total Windows</p><p class="archivevalue" /><p class="mainvalue" /></div>
            <div id="mac"><p class="left">Total Mac</p><p class="archivevalue" /><p class="mainvalue" /></div>
            <div id="lin"><p class="left">Total Linux</p><p class="archivevalue" /><p class="mainvalue" /></div>
            <div id="ad"><p class="left">Total in AD</p><p class="archivevalue" /><p class="mainvalue" /></div>
            <div id="printers"><p class="left">Total Printers</p><p class="archivevalue" /><p class="mainvalue" /></div>
            <div id="fe"><p class="left">Total with Fireeye</p><p class="archivevalue" /><p class="mainvalue" /></div>
            <div id="fe-ad"><p class="left">Total Fireye + AD</p><p class="archivevalue" /><p class="mainvalue" /></div>
        </div>
    </div>
</div>
`;

//link the stylesheet
const linkElement = document.createElement('link');
linkElement.setAttribute('rel', 'stylesheet');
linkElement.setAttribute('href', './pages/summary/archive.css');


//This class has the logic for the custom html element
export class ArchiveComponent extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(linkElement);

        //define counters for each part
        this.totalArchive = 0; 
        this.winArchive = 0; 
        this.linArchive = 0; 
        this.macArchive = 0; 
        this.adArchive = 0; 
        this.printersArchive = 0; 
        this.fireeyeArchive = 0; 
        this.fireeyeADArchive = 0; 

        this.totalMain = 0; 
        this.winMain = 0; 
        this.linMain = 0; 
        this.macMain = 0; 
        this.adMain = 0; 
        this.printersMain = 0; 
        this.fireeyeMain = 0; 
        this.fireeyeADMain = 0;
    }
    connectedCallback(){
        this.setCounters();
    }

    setCounters(){
        const archiveData = appData.getData().Archive;
        const mainData = appData.getData().Main;

        archiveData.forEach(row => {
            this.totalArchive++;
            if(row[4] === 'Windows'){
                this.winArchive++;
            }
            else if(row[4] === 'Mac'){
                this.macArchive++;
            }
            else if(row[4] === 'Linux'){
                this.linArchive++;
            }
            else if(row[4] === 'Printer'){
                this.printersArchive++;
            }

            if(row[10] === 'TRUE'){
                this.fireeyeArchive++;
            }

            if(row[20] !== 'N/A'){
                this.adArchive++;
            }

            if(row[20] !== 'N/A' && row[10] === 'TRUE'){
                this.fireeyeADArchive++;
            }
        });

        mainData.forEach(row => {
            this.totalMain++;
            if(row[7] === 'Windows'){
                this.winMain++;
            }
            else if(row[7] === 'Mac'){
                this.macMain++;
            }
            else if(row[7] === 'Linux'){
                this.linMain++;
            }
            else if(row[7] === 'Printer'){
                this.printersMain++;
            }

            if(row[14] === 'TRUE'){
                this.fireeyeMain++;
            }

            if(row[25] !== 'N/A'){
                this.adMain++;
            }

            if(row[25] !== 'N/A' && row[14] === 'TRUE'){
                this.fireeyeADMain++;
            }
        });

        this.setDataTable();
    }

    setDataTable(){
        this.shadowRoot.querySelector('#total .archivevalue').innerText = this.totalArchive; 
        this.shadowRoot.querySelector('#total .mainvalue').innerText = this.totalMain; 

        this.shadowRoot.querySelector('#win .archivevalue').innerText = this.winArchive; 
        this.shadowRoot.querySelector('#win .mainvalue').innerText = this.winMain;

        this.shadowRoot.querySelector('#mac .archivevalue').innerText = this.macArchive; 
        this.shadowRoot.querySelector('#mac .mainvalue').innerText = this.macMain;

        this.shadowRoot.querySelector('#lin .archivevalue').innerText = this.linArchive; 
        this.shadowRoot.querySelector('#lin .mainvalue').innerText = this.linMain;

        this.shadowRoot.querySelector('#ad .archivevalue').innerText = this.adArchive; 
        this.shadowRoot.querySelector('#ad .mainvalue').innerText = this.adMain;

        this.shadowRoot.querySelector('#printers .archivevalue').innerText = this.printersArchive; 
        this.shadowRoot.querySelector('#printers .mainvalue').innerText = this.printersMain;

        this.shadowRoot.querySelector('#fe .archivevalue').innerText = this.fireeyeArchive; 
        this.shadowRoot.querySelector('#fe .mainvalue').innerText = this.fireeyeMain;

        this.shadowRoot.querySelector('#fe-ad .archivevalue').innerText = this.fireeyeADArchive; 
        this.shadowRoot.querySelector('#fe-ad .mainvalue').innerText = this.fireeyeADMain;
    }
}