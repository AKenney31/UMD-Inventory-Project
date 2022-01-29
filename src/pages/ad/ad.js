import appData from "../../api/frontendData.js";

//This page will hold the contents of the Active Directory spreadsheet. It will display Distinguished Name, DNS Host Name, Name, Description, Last Log On, Operating System,
//and When Created. You can search by Name, and edit the entries.

//Base HTML
const template = document.createElement('template');
template.innerHTML = `
<div id="container">
    <div id="search-container">
        <h2>Active Directory</h2>
        <div id="name-search">
            <input type='text' placeholder="Name" />
            <button>Search</button> 
        </div>
        <div id="display-all">Display All</div>
    </div>
    <div id="data-container">
        <div id="data-header">
            <div>Name</div>
            <div>Distinguished Name</div>
            <div>DNS Host Name</div>
            <div>Description</div>
            <div>Last Log On</div>
            <div>Operating System</div>
            <div>When Created</div>
        </div>
        <div id="data"></div>
    </div>
    <div id="form-container">
        <div id="form-header">
            <div id="form-close">X</div>
        </div>
        <div id="form-labels">
            <div><label for="f-name">NAME</label><textarea type="text" id="f-name"></textarea></div>
            <div><label for="f-dname">DISTINGUISHED NAME</label><textarea type="text" id="f-dname"></textarea></div>
            <div><label for="f-dns">DNS DOMAIN NAME</label><textarea type="text" id="f-dns"></textarea></div>
            <div><label for="f-description">DESCRIPTION</label><textarea type="text" id="f-description"></textarea></div>
            <div><label for="f-lastseen">LAST LOG ON</label><textarea type="text" id="f-lastseen"></textarea></div>
            <div><label for="f-os">OPERATING SYSTEM</label><textarea type="text" id="f-os"></textarea></div>
            <div><label for="f-created">WHEN CREATED</label><textarea type="text" id="f-created"></textarea></div>
        </div>
        <div id="form-submit">
            <div id="submit-button">Submit</div>
        </div>
        <div id="confirmation">
            <h2>Are you sure you want to make these changes?</h2>
            <div id="conf-button-box">
                <div id="confirm">Confirm</div>
                <div id="decline">Decline</div>
            </div>
        </div>
    </div>
</div>
`;

//link the stylesheet
const linkElement = document.createElement('link');
linkElement.setAttribute('rel', 'stylesheet');
linkElement.setAttribute('href', './pages/ad/ad.css');

//This class has the logic for the custom html element
export class ADComponent extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(linkElement);
        this.dataDiv = this.shadowRoot.querySelector('#data');
        this.inputBar = this.shadowRoot.querySelector('input');
        this.displayAll = this.shadowRoot.querySelector('#display-all');
        this.formContainer = this.shadowRoot.querySelector('#form-container');
        this.formContainer.className="form-closed";
        this.confirmation = this.shadowRoot.querySelector('#confirmation');
        this.confirmation.className="conf-closed";
        this.all;
        this.rowCurrentSelected; //Will hold the row currently selected
    }
    connectedCallback(){
        this.setDataArrays();
        this.shadowRoot.querySelector('button').addEventListener('click', () => this.nameSearch());
        this.displayAll.addEventListener('click', () => this.dAll());
        this.shadowRoot.querySelector("#form-submit").addEventListener('click', () => this.confirmation.className="conf-open");
        this.shadowRoot.querySelector("#form-close").addEventListener('click', () => this.formContainer.className = 'form-closed');
        this.shadowRoot.querySelector('#confirm').addEventListener('click', () => this.submitRowChange());
        this.shadowRoot.querySelector('#decline').addEventListener('click', () => this.confirmation.className="conf-closed");
    }
    disconnectedCallback(){
        this.shadowRoot.querySelector('button').removeEventListener('click', () => this.nameSearch());
        this.displayAll.removeEventListener('click', () => this.dAll());
        this.shadowRoot.querySelector("#form-submit").removeEventListener('click', () => this.confirmation.className="conf-open");
        this.shadowRoot.querySelector("#form-close").removeEventListener('click', () => this.formContainer.className = 'form-closed');
        this.shadowRoot.querySelector('#confirm').removeEventListener('click', () => this.submitRowChange());
        this.shadowRoot.querySelector('#decline').removeEventListener('click', () => this.confirmation.className="conf-closed");
    }

    //Name [2], Dist name [0], DNS Name [1], Description [3], Last Log On [5], OS [6 + 7], Created [12]
    setDataArrays(){
        this.all = [];
        const theData = appData.getData().AD;
        var id = 2;
        theData.forEach((row) => {
            if(row[0] !== 'blank'){
                var newRow = {
                    ID: id,
                    Values: [row[2], row[0], row[1], row[3], row[5], row[6] + ' ' + row[7], row[12]]
                };
                this.all.push(newRow);
            }
            id++;
        });
    }

    nameSearch(){
        this.removeCellListeners();
        const newTable = document.createElement('div');
        newTable.id = "table";
        var searchResult = [];
        this.all.forEach((row) => {
            if(row.Values[0].search(this.inputBar.value) !== -1){
                searchResult.push(row);
            }
        });
        if(searchResult.length === 0){
            newTable.innerHTML = `<div id="not-found"><h3>${this.inputBar.value} has not been found</h3></div>`;
        }else{
            searchResult.forEach((row) => {
                const newRow = document.createElement('div');
                newRow.className = "table-entry";
                row.Values.forEach((cell) => {
                    if(cell === 'blank'){
                        cell = '';
                    }
                    const newCell = document.createElement('div');
                    newCell.className = "cell";
                    newCell.innerHTML = cell;
                    newCell.addEventListener('click', () => this.cellClicked(newRow, row));
                    newRow.appendChild(newCell);
                });
                newTable.appendChild(newRow);
            });
        }

        this.dataDiv.childNodes.forEach((child) => {
            this.dataDiv.removeChild(child);
        });
        this.inputBar.value = "";
        this.dataDiv.appendChild(newTable);
    }

    dAll(){
        this.removeCellListeners();
        const newTable = document.createElement('div');
        newTable.id = "table";
        this.all.forEach((row) => {
            const newRow = document.createElement('div');
            newRow.className = "table-entry";
            row.Values.forEach((cell) => {
                if(cell === 'blank'){
                    cell = '';
                }
                const newCell = document.createElement('div');
                newCell.className = "cell";
                newCell.innerHTML = cell;
                newCell.addEventListener('click', () => this.cellClicked(newRow, row));
                newRow.appendChild(newCell);
            });
            newTable.appendChild(newRow);
        });

        this.dataDiv.childNodes.forEach((child) => {
            this.dataDiv.removeChild(child);
        });
        this.inputBar.value = "";
        this.dataDiv.appendChild(newTable);
    }

    removeCellListeners(){
        if(this.dataDiv.childElementCount === 0){
            return;
        }
        this.dataDiv.firstChild.childNodes.forEach((node) => {
            node.childNodes.forEach((cell) => {
                cell.removeEventListener('click', () => this.cellClicked(newRow, row));
            });
        });
        
    }

    //This is what is called when a cell is clicked. It displays the cell change form with the proper inputs
    cellClicked(newRow, rowFromArray){
        if(this.formContainer.className === "form-open" || this.optionsClass === 'on'){
            return;
        }
        var index = 0;
        var row = Array(7);
        newRow.childNodes.forEach((node) => {
            row[index] = node;
            index++;
        });
        //console.log(row);
        this.formContainer.className = "form-open";
        this.formContainer.querySelector("#f-name").value = row[0].innerHTML;
        this.formContainer.querySelector("#f-dname").value = row[1].innerHTML;
        this.formContainer.querySelector("#f-dns").value = row[2].innerHTML;
        this.formContainer.querySelector("#f-description").value = row[3].innerHTML;
        this.formContainer.querySelector("#f-lastseen").value = row[4].innerHTML;
        this.formContainer.querySelector("#f-os").value = row[5].innerHTML;
        this.formContainer.querySelector("#f-created").value = row[6].innerHTML;
        this.rowCurrentSelected = {
            ID: rowFromArray.ID,
            Values: row
        };
    } 
    //Name [2], Dist name [0], DNS Name [1], Description [3], Last Log On [5], OS [6 + 7], Created [12]
    submitRowChange(){
        //close the form and confirmation
        this.confirmation.className = "conf-closed";
        this.formContainer.className = "form-closed";

        //change the text of the cells in the data table to the new values
        this.rowCurrentSelected.Values[0].innerHTML = this.formContainer.querySelector("#f-name").value;
        this.rowCurrentSelected.Values[1].innerHTML = this.formContainer.querySelector("#f-dname").value;
        this.rowCurrentSelected.Values[2].innerHTML = this.formContainer.querySelector("#f-dns").value;
        this.rowCurrentSelected.Values[3].innerHTML = this.formContainer.querySelector("#f-description").value;
        this.rowCurrentSelected.Values[4].innerHTML = this.formContainer.querySelector("#f-lastseen").value;
        this.rowCurrentSelected.Values[5].innerHTML = this.formContainer.querySelector("#f-os").value;
        this.rowCurrentSelected.Values[6].innerHTML = this.formContainer.querySelector("#f-created").value;

        //New array to hold the new new values with blank substituted for blank spaces
        const newValues = [
            this.formContainer.querySelector("#f-name").value === "" ? "blank" : this.formContainer.querySelector("#f-name").value,
            this.formContainer.querySelector("#f-dname").value === "" ? "blank" : this.formContainer.querySelector("#f-dname").value,
            this.formContainer.querySelector("#f-dns").value === "" ? "blank" : this.formContainer.querySelector("#f-dns").value,
            this.formContainer.querySelector("#f-description").value === "" ? "blank" : this.formContainer.querySelector("#f-description").value,
            this.formContainer.querySelector("#f-lastseen").value === "" ? "blank" : this.formContainer.querySelector("#f-lastseen").value,
            this.formContainer.querySelector("#f-os").value === "" ? "blank" : this.formContainer.querySelector("#f-os").value,
            this.formContainer.querySelector("#f-created").value === "" ? "blank" : this.formContainer.querySelector("#f-created").value
        ];

        //Update the values in our appData object
        appData.getData().AD[this.rowCurrentSelected.ID - 2][2] = newValues[0];
        appData.getData().AD[this.rowCurrentSelected.ID - 2][0] = newValues[1];
        appData.getData().AD[this.rowCurrentSelected.ID - 2][1] = newValues[2];
        appData.getData().AD[this.rowCurrentSelected.ID - 2][3] = newValues[3];
        appData.getData().AD[this.rowCurrentSelected.ID - 2][5] = newValues[4];
        //appData.getData().AD[this.rowCurrentSelected.ID - 2][6] = newValues[5];
        appData.getData().AD[this.rowCurrentSelected.ID - 2][12] = newValues[6];

        //Call our update method from our API
        appData.sendChange(`AD04272021!A${this.rowCurrentSelected.ID}`, appData.getData().AD[this.rowCurrentSelected.ID - 2]);

        //Update our data arrays
        this.setDataArrays();
    }
}