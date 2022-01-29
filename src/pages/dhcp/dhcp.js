import appData from "../../api/frontendData.js";

//This Page will display the contents of the main spreadsheet
//Search By IP, or press buttons that will filter by Last Seen, Status, Repeats, All

//Table: IP | Name(if provided) | MAC(if provided) | Status | Type | Usage | Last Seen

//Base HTML for this component
const template = document.createElement('template');
template.innerHTML = `
<div id="container">
    <div id="options" class="on">
        <div id="close-button">X</div>
        <div id="instructions">
            <h2>Options</h2>
            <p>Search for an IP or choose one of the filter options</p>
        </div>
        <div id="search-bar">
            <input type='text' placeholder="IP Address" />
            <button>Search</button>
        </div>
        <div id="dropdown-options">
            <div id="lastseen">Last Seen</div>
            <div id="status">Status</div>
            <div id="all">See All</div>
        </div>
        <div id="dropdown-area"></div>
    </div>
    <div id="data-container">
        <div id="page-header">
            <div id="toggle-options">Options</div>
            <h2>DHCP IPs</h2>
        </div>
        <div id="data-header">
            <div>IP</div>
            <div>Name</div>
            <div>MAC</div>
            <div>Status</div>
            <div>Type</div>
            <div>Usage</div>
            <div>Last Seen</div>
        </div>
        <div id="data"></div>
    </div>
    <div id="form-container">
        <div id="form-header">
            <div id="form-close">X</div>
        </div>
        <div id="form-labels">
            <div><label for="f-ip">IP</label><textarea type="text" id="f-ip"></textarea></div>
            <div><label for="f-name">NAME</label><textarea type="text" id="f-name"></textarea></div>
            <div><label for="f-mac">MAC</label><textarea type="text" id="f-mac"></textarea></div>
            <div><label for="f-status">STATUS</label><textarea type="text" id="f-status"></textarea></div>
            <div><label for="f-type">TYPE</label><textarea type="text" id="f-type"></textarea></div>
            <div><label for="f-usage">USAGE</label><textarea type="text" id="f-usage"></textarea></div>
            <div><label for="f-lastseen">LAST SEEN</label><textarea type="text" id="f-lastseen"></textarea></div>
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
linkElement.setAttribute('href', './pages/dhcp/dhcp.css'); 

//Enum for the dropdowns
const dropdowns = {
    LASTSEEN:'lastseen',
    STATUS:'status'
};

//Enum for setting the data
const datadisplay = {
    USED: 'used',
    UNUSED: 'unused',
    LASTSEENHAS: 'lastseenhas',
    LASTSEENNOTHAVE: 'lastseennothave',
    ALL: 'all'
};

//This class has the logic for the custom html element
export class DHCPComponent extends HTMLElement{
    constructor(){
        super();
        this.optionsClass = 'on'; //State of the options screen (on or off)
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(linkElement);
        this.hasDropdownSelected = false; //Identifies whether or not there is a dropdown selected
        this.currentDropdown; //Will hold a value from the dropdowns enum to represent the current selected dropdown
        this.rowCurrentSelected; //Will hold the row currently selected

        //Preset arrays to hold our data
        this.lastSeenHas;
        this.lastSeenNotHave;
        this.used;
        this.unused;
        this.all;

        this.options = this.shadowRoot.querySelector('#options');
        this.inputBar = this.shadowRoot.querySelector('input');
        this.dataDiv = this.shadowRoot.querySelector('#data');
        this.dropdownArea = this.shadowRoot.querySelector('#dropdown-area');
        this.lastSeenBut = this.shadowRoot.querySelector('#lastseen');
        this.statusBut = this.shadowRoot.querySelector('#status');
        this.formContainer = this.shadowRoot.querySelector('#form-container');
        this.formContainer.className="form-closed";
        this.confirmation = this.shadowRoot.querySelector('#confirmation');
        this.confirmation.className="conf-closed";
    }
    connectedCallback(){
        this.setDataArrays();
        this.shadowRoot.querySelector('button').addEventListener('click', () => this.ipSearch());
        this.shadowRoot.querySelector('#toggle-options').addEventListener('click', () => this.toggleOptionsClicked());
        this.shadowRoot.querySelector('#close-button').addEventListener('click', () => this.toggleOptionsClicked());
        this.lastSeenBut.addEventListener('click', () => this.lastSeenDropdown());
        this.statusBut.addEventListener('click', () => this.statusDropdown());
        this.shadowRoot.querySelector('#all').addEventListener('click', () => {
            this.toggleOptionsClicked();
            this.unselectDropdowns(); 
            this.writeToData(datadisplay.ALL);
        });
        this.shadowRoot.querySelector("#form-submit").addEventListener('click', () => this.confirmation.className="conf-open");
        this.shadowRoot.querySelector("#form-close").addEventListener('click', () => this.formContainer.className = 'form-closed');
        this.shadowRoot.querySelector('#confirm').addEventListener('click', () => this.submitRowChange());
        this.shadowRoot.querySelector('#decline').addEventListener('click', () => this.confirmation.className="conf-closed");
    }
    disconnectedCallback(){
        this.shadowRoot.querySelector('button').removeEventListener('click', () => this.ipSearch());
        this.shadowRoot.querySelector('#toggle-options').removeEventListener('click', () => this.toggleOptionsClicked());
        this.shadowRoot.querySelector('#close-button').removeEventListener('click', () => this.toggleOptionsClicked());
        this.lastSeenBut.removeEventListener('click', () => this.lastSeenDropdown());
        this.statusBut.removeEventListener('click', () => this.statusDropdown());
        this.shadowRoot.querySelector('#all').removeEventListener('click', () => {
            this.toggleOptionsClicked();
            this.unselectDropdowns(); 
            this.writeToData(datadisplay.ALL);
        });
        this.shadowRoot.querySelector("#form-submit").removeEventListener('click', () => this.confirmation.className="conf-open");
        this.shadowRoot.querySelector("#form-close").removeEventListener('click', () => this.formContainer.className = 'form-closed');
        this.shadowRoot.querySelector('#confirm').removeEventListener('click', () => this.submitRowChange());
        this.shadowRoot.querySelector('#decline').removeEventListener('click', () => this.confirmation.className="conf-closed");
        this.unselectDropdowns();
    }

    //ip[0], name[1], mac[2], status[4], type[5], usage[7], last seen[12]
    //This method presets data into the data arrays
    setDataArrays(){
        this.lastSeenHas = [];
        this.lastSeenNotHave = [];
        this.used = [];
        this.unused = [];
        this.all = [];

        var id = 2;
        const theData = appData.getData().DHCP;
        theData.forEach((row) => {
            if(row[0] !== 'IP Address' && row[0] !== 'blank'){
                var newRow = {
                    ID: id,
                    Values: [row[0], row[1], row[2], row[4], row[5], row[7], row[12]]
                };
                this.all.push(newRow);
                if(row[4] === 'Used'){
                    this.used.push(newRow);
                }else{
                    this.unused.push(newRow);
                }

                if(row[12] === 'blank'){
                    this.lastSeenNotHave.push(newRow);
                }else{
                    this.lastSeenHas.push(newRow);
                }
            }
            id++;
        });
    }

    //This method handles the event in which an individual ip is searched
    ipSearch(){
        //console.log('search');
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
        this.toggleOptionsClicked();
        this.unselectDropdowns();
    }

    //This method switches between the options screen showing and not showing.
    toggleOptionsClicked(){
        if(this.optionsClass === 'on'){
            this.optionsClass = 'off';
            this.options.className = 'off';
        }else{
            this.optionsClass = 'on';
            this.options.className = 'on';
            this.confirmation.className = 'conf-closed';
            this.formContainer.className = 'form-closed';
        }
    }

    //This method will remove the event handlers for the selected dropdown if there is a selected dropdown
    unselectDropdowns(){
        if(this.hasDropdownSelected === true){
            switch(this.currentDropdown){
                case dropdowns.LASTSEEN:
                    this.clearLastSeenHandlers();
                    this.lastSeenBut.style.backgroundColor = 'lightcoral';
                    this.currentDropdown = null;
                    this.hasDropdownSelected = false;
                    this.dropdownArea.innerHTML = '';
                    break;
                case dropdowns.STATUS:
                    this.clearStatusHandlers();
                    this.statusBut.style.backgroundColor = 'lightcoral';
                    this.currentDropdown = null;
                    this.hasDropdownSelected = false;
                    this.dropdownArea.innerHTML = '';
                    break;
            }
        }
    }

    //The following two methods handle when you click on a dropdown. They have the same logic, but differ in contents since they handle different dropdowns
    lastSeenDropdown(){
        if(this.hasDropdownSelected === true){ //If there is no dropdown selected, this is skipped

            //This switch is responsible for unselecting the currently selected dropdown in order to then select the new one
            switch(this.currentDropdown){
                case dropdowns.LASTSEEN: //If you click on the currently selected dropdown, it will close
                    this.clearLastSeenHandlers();
                    this.lastSeenBut.style.backgroundColor = 'lightcoral';
                    this.currentDropdown = null;
                    this.hasDropdownSelected = false;
                    this.dropdownArea.innerHTML = '';
                    return;
                case dropdowns.STATUS:
                    this.statusBut.style.backgroundColor = 'lightcoral';
                    this.clearStatusHandlers();
                    break;
            }
        }
        //The following code sets the new selected dropdown and changes to the appropriate contents of the dropdown area
        this.hasDropdownSelected = true;
        this.currentDropdown = dropdowns.LASTSEEN;
        this.dropdownArea.innerHTML = `
        <div id='provided'>Provided</div>
        <div id='not-provided'>Not Provided</div>
        `
        this.addLastSeenHandlers();
        this.lastSeenBut.style.backgroundColor = 'crimson';
    }
    statusDropdown(){
        if(this.hasDropdownSelected === true){ 
            switch(this.currentDropdown){
                case dropdowns.STATUS: 
                    this.clearStatusHandlers();
                    this.statusBut.style.backgroundColor = 'lightcoral';
                    this.currentDropdown = null;
                    this.hasDropdownSelected = false;
                    this.dropdownArea.innerHTML = '';
                    return;
                case dropdowns.LASTSEEN:
                    this.lastSeenBut.style.backgroundColor = 'lightcoral';
                    this.clearLastSeenHandlers();
                    break;
            }
        }
        this.hasDropdownSelected = true;
        this.currentDropdown = dropdowns.STATUS;
        this.dropdownArea.innerHTML = `
        <div id='used'>USED</div>
        <div id='unused'>UNUSED</div>
        `
        this.addStatusHandlers();
        this.statusBut.style.backgroundColor = 'crimson';
    }

    //The remaining methods add and remove event handlers to the newly added dropdown options from above.
    addLastSeenHandlers(){
        this.shadowRoot.querySelector('#provided').addEventListener('click', () => {
            this.writeToData(datadisplay.LASTSEENHAS);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#not-provided').addEventListener('click', () => {
            this.writeToData(datadisplay.LASTSEENNOTHAVE);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
    }
    clearLastSeenHandlers(){
        this.shadowRoot.querySelector('#provided').removeEventListener('click', () => {
            this.writeToData(datadisplay.LASTSEENHAS);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#not-provided').removeEventListener('click', () => {
            this.writeToData(datadisplay.LASTSEENNOTHAVE);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
    }

    addStatusHandlers(){
        this.shadowRoot.querySelector('#used').addEventListener('click', () => {
            this.writeToData(datadisplay.USED);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#unused').addEventListener('click', () => {
            this.writeToData(datadisplay.UNUSED);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
    }
    clearStatusHandlers(){
        this.shadowRoot.querySelector('#used').removeEventListener('click', () => {
            this.writeToData(datadisplay.USED);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#unused').removeEventListener('click', () => {
            this.writeToData(datadisplay.UNUSED);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
    }

    //This method sets the data table and displays it in the data div
    writeToData(display){
        var table;
        this.removeCellListeners();

        switch(display){
            case datadisplay.USED:
                table = this.loopThroughArray(this.used);
                break;
            case datadisplay.UNUSED:
                table = this.loopThroughArray(this.unused);
                break;
            case datadisplay.LASTSEENHAS:
                table = this.loopThroughArray(this.lastSeenHas);
                break;
            case datadisplay.LASTSEENNOTHAVE:
                table = this.loopThroughArray(this.lastSeenNotHave);
                break;
            case datadisplay.ALL:
                table = this.loopThroughArray(this.all);
                break;
        }
        this.dataDiv.childNodes.forEach((child) => {
            this.dataDiv.removeChild(child);
        });
        this.dataDiv.appendChild(table);
    }

    //This method creates the data table based off the given array
    loopThroughArray(loopArray){
        const newTable = document.createElement('div');
        newTable.id = "table";
        loopArray.forEach((row) => {
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

        return newTable;
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
        this.formContainer.querySelector("#f-ip").value = row[0].innerHTML;
        this.formContainer.querySelector("#f-name").value = row[1].innerHTML;
        this.formContainer.querySelector("#f-mac").value = row[2].innerHTML;
        this.formContainer.querySelector("#f-status").value = row[3].innerHTML;
        this.formContainer.querySelector("#f-type").value = row[4].innerHTML;
        this.formContainer.querySelector("#f-usage").value = row[5].innerHTML;
        this.formContainer.querySelector("#f-lastseen").value = row[6].innerHTML;
        this.rowCurrentSelected = {
            ID: rowFromArray.ID,
            Values: row
        };
    } 
    //ip[0], name[1], mac[2], status[4], type[5], usage[7], last seen[12]
    submitRowChange(){
        //close the form and confirmation
        this.confirmation.className = "conf-closed";
        this.formContainer.className = "form-closed";

        //change the text of the cells in the data table to the new values
        this.rowCurrentSelected.Values[0].innerHTML = this.formContainer.querySelector("#f-ip").value;
        this.rowCurrentSelected.Values[1].innerHTML = this.formContainer.querySelector("#f-name").value;
        this.rowCurrentSelected.Values[2].innerHTML = this.formContainer.querySelector("#f-mac").value;
        this.rowCurrentSelected.Values[3].innerHTML = this.formContainer.querySelector("#f-status").value;
        this.rowCurrentSelected.Values[4].innerHTML = this.formContainer.querySelector("#f-type").value;
        this.rowCurrentSelected.Values[5].innerHTML = this.formContainer.querySelector("#f-usage").value;
        this.rowCurrentSelected.Values[6].innerHTML = this.formContainer.querySelector("#f-lastseen").value;

        //New array to hold the new new values with blank substituted for blank spaces
        const newValues = [
            this.formContainer.querySelector("#f-ip").value === "" ? "blank" : this.formContainer.querySelector("#f-ip").value,
            this.formContainer.querySelector("#f-name").value === "" ? "blank" : this.formContainer.querySelector("#f-name").value,
            this.formContainer.querySelector("#f-mac").value === "" ? "blank" : this.formContainer.querySelector("#f-mac").value,
            this.formContainer.querySelector("#f-status").value === "" ? "blank" : this.formContainer.querySelector("#f-status").value,
            this.formContainer.querySelector("#f-type").value === "" ? "blank" : this.formContainer.querySelector("#f-type").value,
            this.formContainer.querySelector("#f-usage").value === "" ? "blank" : this.formContainer.querySelector("#f-usage").value,
            this.formContainer.querySelector("#f-lastseen").value === "" ? "blank" : this.formContainer.querySelector("#f-lastseen").value
        ];

        //Update the values in our appData object
        appData.getData().DHCP[this.rowCurrentSelected.ID - 2][0] = newValues[0];
        appData.getData().DHCP[this.rowCurrentSelected.ID - 2][1] = newValues[1];
        appData.getData().DHCP[this.rowCurrentSelected.ID - 2][2] = newValues[2];
        appData.getData().DHCP[this.rowCurrentSelected.ID - 2][4] = newValues[3];
        appData.getData().DHCP[this.rowCurrentSelected.ID - 2][5] = newValues[4];
        appData.getData().DHCP[this.rowCurrentSelected.ID - 2][7] = newValues[5];
        appData.getData().DHCP[this.rowCurrentSelected.ID - 2][12] = newValues[6];

        //Call our update method from our API
        appData.sendChange(`DHCPIP02162021!A${this.rowCurrentSelected.ID}`, appData.getData().DHCP[this.rowCurrentSelected.ID - 2]);

        //Update our data arrays
        this.setDataArrays();
    }
}