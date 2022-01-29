import appData from "../../api/frontendData.js";
//import { DeptComponent } from "./dept.js";

//window.customElements.define('dept-component', DeptComponent);
//This page will display the contents of the Summary spreadsheet broken down into departments

//Creating the base html for our custom element
const template = document.createElement('template');
template.innerHTML = `
<div id='contents'>
    <div id='options-container'>
        <h1>SUMMARY</h1>
        <div id='options'>
            <span class='bioe'></span>
            <div id='BIOE'>BIOE</div>
            <div id='CHBE'>CHBE</div>
            <div id='CEE'>CEE</div>
            <div id='ECE'>ECE</div>
            <div id='EIT'>EIT</div>
            <div id='ENGR'>ENGR</div>
            <div id='FPE'>FPE</div>
            <div id='IREAP'>IREAP</div>
            <div id='ISR'>ISR</div>
            <div id='MATH'>MATH</div>
            <div id='MSE'>MSE</div>
            <div id='PHYS'>PHYS</div>
            <div id='ALL'>ALL</div>
            <div id='ARCHIVE'>ARCHIVE</div>
        </div>
    </div>
    <div id='data'></div>
</div>
`

//link the stylesheet
const linkElement = document.createElement('link');
linkElement.setAttribute('rel', 'stylesheet');
linkElement.setAttribute('href', './pages/summary/summary.css');

//make an enum for all our pages
const pages = {
    BIOE: 'bioe',
    CHBE: 'chbe',
    CEE: 'cee',
    ECE: 'ece',
    EIT: 'eit',
    ENGR: 'engr',
    FPE: 'fpe',
    IREAP: 'ireap',
    ISR: 'isr',
    MATH: 'math',
    MSE: 'mse',
    PHYS: 'phys',
    ALL: 'all',
    ARCHIVE: 'archive'
};

//This class has the logic for the custom html element
export class SummaryComponent extends HTMLElement{
    constructor(){
        super();
        //Data Arrays
        this.bioeData = [];
        this.chbeData = [];
        this.ceeData = [];
        this.eceData = [];
        this.eitData = [];
        this.engrData = [];
        this.fpeData = [];
        this.ireapData = [];
        this.isrData = [];
        this.mathData = [];
        this.mseData = [];
        this.physData = [];
        this.allData = [];

        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(linkElement);
        this.animationSpan = this.shadowRoot.querySelector('span');
        this.dataDiv = this.shadowRoot.querySelector('#data');
        
        //default page to bioe
        this.currentpage = pages.BIOE;
    }
    //This method is automatically called when the custom component is loaded onto a page. It is responsible for setting the event listeners
    connectedCallback(){
        this.setDataArrays();
        this.setPage();
        this.shadowRoot.querySelector('#BIOE').addEventListener('click', () => this.buttonClicked(pages.BIOE));
        this.shadowRoot.querySelector('#CHBE').addEventListener('click', () => this.buttonClicked(pages.CHBE));
        this.shadowRoot.querySelector('#CEE').addEventListener('click', () => this.buttonClicked(pages.CEE));
        this.shadowRoot.querySelector('#ECE').addEventListener('click', () => this.buttonClicked(pages.ECE));
        this.shadowRoot.querySelector('#EIT').addEventListener('click', () => this.buttonClicked(pages.EIT));
        this.shadowRoot.querySelector('#ENGR').addEventListener('click', () => this.buttonClicked(pages.ENGR));
        this.shadowRoot.querySelector('#FPE').addEventListener('click', () => this.buttonClicked(pages.FPE));
        this.shadowRoot.querySelector('#IREAP').addEventListener('click', () => this.buttonClicked(pages.IREAP));
        this.shadowRoot.querySelector('#ISR').addEventListener('click', () => this.buttonClicked(pages.ISR));
        this.shadowRoot.querySelector('#MATH').addEventListener('click', () => this.buttonClicked(pages.MATH));
        this.shadowRoot.querySelector('#MSE').addEventListener('click', () => this.buttonClicked(pages.MSE));
        this.shadowRoot.querySelector('#PHYS').addEventListener('click', () => this.buttonClicked(pages.PHYS));
        this.shadowRoot.querySelector('#ALL').addEventListener('click', () => this.buttonClicked(pages.ALL));
        this.shadowRoot.querySelector('#ARCHIVE').addEventListener('click', () => this.buttonClicked(pages.ARCHIVE));
    }
    //This method is automatically called when the custom component is unloaded a page. It is responsible for removing the event listeners
    disconnectedCallback(){
        this.shadowRoot.querySelector('#BIOE').removeEventListener('click', () => this.buttonClicked(pages.BIOE));
        this.shadowRoot.querySelector('#CHBE').removeEventListener('click', () => this.buttonClicked(pages.CHBE));
        this.shadowRoot.querySelector('#CEE').removeEventListener('click', () => this.buttonClicked(pages.CEE));
        this.shadowRoot.querySelector('#ECE').removeEventListener('click', () => this.buttonClicked(pages.ECE));
        this.shadowRoot.querySelector('#EIT').removeEventListener('click', () => this.buttonClicked(pages.EIT));
        this.shadowRoot.querySelector('#ENGR').removeEventListener('click', () => this.buttonClicked(pages.ENGR));
        this.shadowRoot.querySelector('#FPE').removeEventListener('click', () => this.buttonClicked(pages.FPE));
        this.shadowRoot.querySelector('#IREAP').removeEventListener('click', () => this.buttonClicked(pages.IREAP));
        this.shadowRoot.querySelector('#ISR').removeEventListener('click', () => this.buttonClicked(pages.ISR));
        this.shadowRoot.querySelector('#MATH').removeEventListener('click', () => this.buttonClicked(pages.MATH));
        this.shadowRoot.querySelector('#MSE').removeEventListener('click', () => this.buttonClicked(pages.MSE));
        this.shadowRoot.querySelector('#PHYS').removeEventListener('click', () => this.buttonClicked(pages.PHYS));
        this.shadowRoot.querySelector('#ALL').removeEventListener('click', () => this.buttonClicked(pages.ALL));
        this.shadowRoot.querySelector('#ARCHIVE').removeEventListener('click', () => this.buttonClicked(pages.ARCHIVE));
    }

    setDataArrays(){
        const data = appData.getData().Summary;
        //console.log(data);

        data.forEach(row => {
            this.bioeData.push(row[0]);
            this.chbeData.push(row[1]);
            this.ceeData.push(row[2]);
            this.eceData.push(row[3]);
            this.eitData.push(row[4]);
            this.engrData.push(row[5]);
            this.fpeData.push(row[6]);
            this.ireapData.push(row[7]);
            this.isrData.push(row[8]);
            this.mathData.push(row[9]);
            this.mseData.push(row[10]);
            this.physData.push(row[11]);
        });
        //console.log(this.mathData);

        //sum left [12]
        this.allData = [
            data[0][13], //total
            data[2][13], //win
            data[3][13], //mac
            data[1][13], //linux
            data[4][12], //ad
            data[5][12], //ad-pvs
            data[6][13], //pvs
            data[7][13], //printers
            data[8][13], //fe-ad
            data[9][12], //fe
            data[8][15], //p-fe-ad
            data[2][15] //p-win-ad
        ];
    }

    //This method is the callback to all of the navigation event listeners. It is responsible for setting the new value of current page, toggling the animation 
    //and calling setPage if necessary.
    buttonClicked(page){
        if(this.currentpage !== page){
            this.currentpage = page;
            this.animationSpan.className = page;
            this.setPage();
        }
    }

    //This method will set the contents of the data section to the appropriate data given the value of currentpage
    setPage(){
        switch(this.currentpage){
            case pages.BIOE:
                this.dataDiv.innerHTML = `
                <dept-component name="BIOE" total=${this.bioeData[0]} win=${this.bioeData[2]} mac=${this.bioeData[3]} linux=${this.bioeData[1]} 
                ad=${this.bioeData[4]} ad-pvs=${this.bioeData[5]} pvs=${this.bioeData[6]} printers=${this.bioeData[7]} fe-ad=${this.bioeData[8]} 
                fe=${this.bioeData[9]} p-fe-ad=${this.bioeData[10]} p-fe-mw=${this.bioeData[11]} p-ninite=${this.bioeData[13]} 
                p-jamf=${this.bioeData[15]} />
                `
                break;
            case pages.CEE:
                this.dataDiv.innerHTML = `
                <dept-component name="CEE" total=${this.ceeData[0]} win=${this.ceeData[2]} mac=${this.ceeData[3]} linux=${this.ceeData[1]} 
                ad=${this.ceeData[4]} ad-pvs=${this.ceeData[5]} pvs=${this.ceeData[6]} printers=${this.ceeData[7]} fe-ad=${this.ceeData[8]} 
                fe=${this.ceeData[9]} p-fe-ad=${this.ceeData[10]} p-fe-mw=${this.ceeData[11]} p-ninite=${this.ceeData[13]} 
                p-jamf=${this.ceeData[15]} />
                `
                break;
            case pages.CHBE:
                this.dataDiv.innerHTML = `
                <dept-component name="CHBE" total=${this.chbeData[0]} win=${this.chbeData[2]} mac=${this.chbeData[3]} linux=${this.chbeData[1]} 
                ad=${this.chbeData[4]} ad-pvs=${this.chbeData[5]} pvs=${this.chbeData[6]} printers=${this.chbeData[7]} fe-ad=${this.chbeData[8]} 
                fe=${this.chbeData[9]} p-fe-ad=${this.chbeData[10]} p-fe-mw=${this.chbeData[11]} p-ninite=${this.chbeData[13]} 
                p-jamf=${this.chbeData[15]} />
                `
                break;
            case pages.ECE:
                this.dataDiv.innerHTML = `
                <dept-component name="ECE" total=${this.eceData[0]} win=${this.eceData[2]} mac=${this.eceData[3]} linux=${this.eceData[1]} 
                ad=${this.eceData[4]} ad-pvs=${this.eceData[5]} pvs=${this.eceData[6]} printers=${this.eceData[7]} fe-ad=${this.eceData[8]} 
                fe=${this.eceData[9]} p-fe-ad=${this.eceData[10]} p-fe-mw=${this.eceData[11]} p-ninite=${this.eceData[13]} 
                p-jamf=${this.eceData[15]} />
                `
                break;
            case pages.EIT:
                this.dataDiv.innerHTML = `
                <dept-component name="EIT" total=${this.eitData[0]} win=${this.eitData[2]} mac=${this.eitData[3]} linux=${this.eitData[1]} 
                ad=${this.eitData[4]} ad-pvs=${this.eitData[5]} pvs=${this.eitData[6]} printers=${this.eitData[7]} fe-ad=${this.eitData[8]} 
                fe=${this.eitData[9]} p-fe-ad=${this.eitData[10]} p-fe-mw=${this.eitData[11]} p-ninite=${this.eitData[13]} 
                p-jamf=${this.eitData[15]} />
                `
                break;
            case pages.ENGR:
                this.dataDiv.innerHTML = `
                <dept-component name="ENGR" total=${this.engrData[0]} win=${this.engrData[2]} mac=${this.engrData[3]} linux=${this.engrData[1]} 
                ad=${this.engrData[4]} ad-pvs=${this.engrData[5]} pvs=${this.engrData[6]} printers=${this.engrData[7]} fe-ad=${this.engrData[8]} 
                fe=${this.engrData[9]} p-fe-ad=${this.engrData[10]} p-fe-mw=${this.engrData[11]} p-ninite=${this.engrData[13]} 
                p-jamf=${this.engrData[15]} />
                `
                break;
            case pages.FPE:
                this.dataDiv.innerHTML = `
                <dept-component name="FPE" total=${this.fpeData[0]} win=${this.fpeData[2]} mac=${this.fpeData[3]} linux=${this.fpeData[1]} 
                ad=${this.fpeData[4]} ad-pvs=${this.fpeData[5]} pvs=${this.fpeData[6]} printers=${this.fpeData[7]} fe-ad=${this.fpeData[8]} 
                fe=${this.fpeData[9]} p-fe-ad=${this.fpeData[10]} p-fe-mw=${this.fpeData[11]} p-ninite=${this.fpeData[13]} 
                p-jamf=${this.fpeData[15]} />
                `
                break;
            case pages.IREAP:
                this.dataDiv.innerHTML = `
                <dept-component name="IREAP" total=${this.ireapData[0]} win=${this.ireapData[2]} mac=${this.ireapData[3]} linux=${this.ireapData[1]} 
                ad=${this.ireapData[4]} ad-pvs=${this.ireapData[5]} pvs=${this.ireapData[6]} printers=${this.ireapData[7]} fe-ad=${this.ireapData[8]} 
                fe=${this.ireapData[9]} p-fe-ad=${this.ireapData[10]} p-fe-mw=${this.ireapData[11]} p-ninite=${this.ireapData[13]} 
                p-jamf=${this.ireapData[15]} />
                `
                break;
            case pages.ISR:
                this.dataDiv.innerHTML = `
                <dept-component name="ISR" total=${this.isrData[0]} win=${this.isrData[2]} mac=${this.isrData[3]} linux=${this.isrData[1]} 
                ad=${this.isrData[4]} ad-pvs=${this.isrData[5]} pvs=${this.isrData[6]} printers=${this.isrData[7]} fe-ad=${this.isrData[8]} 
                fe=${this.isrData[9]} p-fe-ad=${this.isrData[10]} p-fe-mw=${this.isrData[11]} p-ninite=${this.isrData[13]} 
                p-jamf=${this.isrData[15]} />
                `
                break;
            case pages.MATH:
                this.dataDiv.innerHTML = `
                <dept-component name="MATH" total=${this.mathData[0]} win=${this.mathData[2]} mac=${this.mathData[3]} linux=${this.mathData[1]} 
                ad=${this.mathData[4]} ad-pvs=${this.mathData[5]} pvs=${this.mathData[6]} printers=${this.mathData[7]} fe-ad=${this.mathData[8]} 
                fe=${this.mathData[9]} p-fe-ad=${this.mathData[10]} p-fe-mw=${this.mathData[11]} p-ninite=${this.mathData[13]} 
                p-jamf=${this.mathData[15]} />
                `
                break;
            case pages.MSE:
                this.dataDiv.innerHTML = `
                <dept-component name="MSE" total=${this.mseData[0]} win=${this.mseData[2]} mac=${this.mseData[3]} linux=${this.mseData[1]} 
                ad=${this.mseData[4]} ad-pvs=${this.mseData[5]} pvs=${this.mseData[6]} printers=${this.mseData[7]} fe-ad=${this.mseData[8]} 
                fe=${this.mseData[9]} p-fe-ad=${this.mseData[10]} p-fe-mw=${this.mseData[11]} p-ninite=${this.mseData[13]} 
                p-jamf=${this.mseData[15]} />
                `
                break;
            case pages.PHYS:
                this.dataDiv.innerHTML = `
                <dept-component name="PHYS" total=${this.physData[0]} win=${this.physData[2]} mac=${this.physData[3]} linux=${this.physData[1]} 
                ad=${this.physData[4]} ad-pvs=${this.physData[5]} pvs=${this.physData[6]} printers=${this.physData[7]} fe-ad=${this.physData[8]} 
                fe=${this.physData[9]} p-fe-ad=${this.physData[10]} p-fe-mw=${this.physData[11]} p-ninite=${this.physData[13]} 
                p-jamf=${this.physData[15]} />
                `
                break;
            case pages.ALL:
                this.dataDiv.innerHTML = `
                    <all-component name="ALL" total=${this.allData[0]} win=${this.allData[1]} mac=${this.allData[2]} linux=${this.allData[3]} ad=${this.allData[4]} 
                    ad-pvs=${this.allData[5]} pvs=${this.allData[6]} printers=${this.allData[7]} fe-ad=${this.allData[8]} fe=${this.allData[9]} p-fe-ad=${this.allData[10]} 
                    p-win-ad=${this.allData[11]} />           
                `
                break;
            case pages.ARCHIVE:
                this.dataDiv.innerHTML = `<archive-component />`;
        }
    }
}