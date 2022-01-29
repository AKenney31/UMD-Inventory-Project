import appData from "../../api/frontendData.js";

//This Page will display the contents of the main spreadsheet
//Search By Machine Name, or press buttons that will filter by Dept, OS type, Fireeye Installed...

//Table: Name | DNS Domain | Department | OS | Fireeye | Notes

//Base HTML for this component
const template = document.createElement('template');
template.innerHTML = `
<div id="container">
    <div id="options" class="on">
        <div id="close-button">X</div>
        <div id="instructions">
            <h2>Options</h2>
            <p>Search for a machine name or choose one of the filter options</p>
        </div>
        <div id="search-bar">
            <input type='text' placeholder="Machine Name" />
            <button>Search</button>
        </div>
        <div id="dropdown-options">
            <div id="dept-dropdown" class="">Dept</div>
            <div id="os-dropdown" class="">OS</div>
            <div id="fireeye-dropdown" class="">Fireeye</div>
            <div id="repeats">See Repeats</div>
            <div id="all">See All</div>
        </div>
        <div id="dropdown-area"></div>
    </div>
    <div id="data-container">
        <div id="page-header">
            <div id="toggle-options">Options</div>
            <h2>Main</h2>
        </div>
        <div id="data-header">
            <div>Name</div>
            <div>DNS Domain</div>
            <div>Department</div>
            <div>Operating System</div>
            <div>Fireeye Installed</div>
            <div>Notes</div>
        </div>
        <div id="data"></div>
    </div>
    <div id="form-container">
        <div id="form-header">
            <div id="form-close">X</div>
        </div>
        <div id="form-labels">
            <div><label for="f-name">NAME</label><textarea type="text" id="f-name"></textarea></div>
            <div><label for="f-dns">DNS DOMAIN</label><textarea type="text" id="f-dns"></textarea></div>
            <div><label for="f-dept">DEPARTMENT</label><textarea type="text" id="f-dept"></textarea></div>
            <div><label for="f-os">OPERATING SYSTEM</label><textarea type="text" id="f-os"></textarea></div>
            <div><label for="f-fireeye">FIREEYE INSTALLED</label><textarea type="text" id="f-fireeye"></textarea></div>
            <div><label for="f-notes">NOTES</label><textarea type="text" id="f-notes"></textarea></div>
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
linkElement.setAttribute('href', './pages/main/main.css');


//Enum for the dropdowns
const dropdowns = {
    DEPT:'dept',
    OS:'os',
    FIREEYE:'fireeye'
};

//Enum for filters
const filters = {
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
    WINDOWS: 'windows',
    MAC: 'mac',
    LINUX: 'linux',
    OSNOTPROVIDED: 'osnotprovided',
    FIREEYETRUE: 'fireeyetrue',
    FIREEYEFALSE: 'fireeyefalse',
    REPEATS: 'repeats'
};

//This class has the logic for the custom html element
export class MainComponent extends HTMLElement{
    constructor(){
        super();
        this.dataPayload;
        this.optionsClass = 'on'; //State of the options screen (on or off)
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.appendChild(linkElement);
        this.hasDropdownSelected = false; //Identifies whether or not there is a dropdown selected
        this.currentDropdown; //Will hold a value from the dropdowns enum to represent the current selected dropdown
        this.rowCurrentSelected; //Will hold the html elements of the row currently selected
        
        this.options = this.shadowRoot.querySelector('#options');
        this.inputBar = this.shadowRoot.querySelector('input');
        this.dataDiv = this.shadowRoot.querySelector('#data');
        this.dropdownArea = this.shadowRoot.querySelector('#dropdown-area');
        this.deptBut = this.shadowRoot.querySelector('#dept-dropdown');
        this.osBut = this.shadowRoot.querySelector('#os-dropdown');
        this.fireeyeBut = this.shadowRoot.querySelector('#fireeye-dropdown');
        this.formContainer = this.shadowRoot.querySelector('#form-container');
        this.formContainer.className="form-closed";
        this.confirmation = this.shadowRoot.querySelector('#confirmation');
        this.confirmation.className="conf-closed";

        //Define Data Arrays
        this.BIOEArray;
        this.CHBEArray;
        this.CEEArray;
        this.ECEArray;
        this.EITArray;
        this.ENGRArray;
        this.FPEArray;
        this.IREAPArray;
        this.ISRArray;
        this.MATHArray;
        this.MSEArray;
        this.PHYSArray;
        this.allArray;
        this.windowsArray;
        this.macArray;
        this.linuxArray;
        this.osNotProvidedArray;
        this.fireeyeTrueArray;
        this.fireeyeFalseArray;
        this.repeats;
    }

    //This method is automatically called upon loading the component, it is responsible for setting event listeners
    connectedCallback(){
        this.setDataArrays();
        this.shadowRoot.querySelector('button').addEventListener('click', () => this.machineSearch());
        this.shadowRoot.querySelector('#toggle-options').addEventListener('click', () => this.toggleOptionsClicked());
        this.shadowRoot.querySelector('#close-button').addEventListener('click', () => this.toggleOptionsClicked());
        this.deptBut.addEventListener('click', () => this.deptDropdown());
        this.osBut.addEventListener('click', () => this.osDropdown());
        this.fireeyeBut.addEventListener('click', () => this.fireeyeDropdown());
        this.shadowRoot.querySelector('#repeats').addEventListener('click', () => {
            this.writeToData(filters.REPEATS);
            this.toggleOptionsClicked(); 
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#all').addEventListener('click', () => {
            this.writeToData(filters.ALL);
            this.toggleOptionsClicked();
            this.unselectDropdowns(); 
        });
        this.shadowRoot.querySelector("#form-submit").addEventListener('click', () => this.confirmation.className="conf-open");
        this.shadowRoot.querySelector("#form-close").addEventListener('click', () => this.formContainer.className = 'form-closed');
        this.shadowRoot.querySelector('#confirm').addEventListener('click', () => this.submitRowChange());
        this.shadowRoot.querySelector('#decline').addEventListener('click', () => this.confirmation.className="conf-closed");
    }

    //This method is automatically called upon unloading the component, it is responsible for removing event listeners
    disconnectedCallback(){
        this.shadowRoot.querySelector('button').removeEventListener('click', () => this.machineSearch());
        this.shadowRoot.querySelector('#toggle-options').removeEventListener('click', () => this.toggleOptionsCLicked());
        this.shadowRoot.querySelector('#close-button').removeEventListener('click', () => this.toggleOptionsClicked());
        this.deptBut.removeEventListener('click', () => this.deptDropdown());
        this.osBut.removeEventListener('click', () => this.osDropdown());
        this.fireeyeBut.removeEventListener('click', () => this.fireeyeDropdown());
        this.shadowRoot.querySelector('#repeats').removeEventListener('click', () => {
            this.writeToData(filters.REPEATS);
            this.toggleOptionsClicked(); 
            this.unselectDropdowns(); 
        });
        this.shadowRoot.querySelector('#all').removeEventListener('click', () => {
            this.writeToData(filters.ALL);
            this.toggleOptionsClicked();
            this.unselectDropdowns();  
        });
        this.shadowRoot.querySelector("#form-submit").removeEventListener('click', () => this.confirmation.className="conf-open");
        this.shadowRoot.querySelector("#form-close").removeEventListener('click', () => this.formContainer.className = 'form-closed');
        this.shadowRoot.querySelector('#confirm').removeEventListener('click', () => this.submitRowChange());
        this.shadowRoot.querySelector('#decline').removeEventListener('click', () => this.confirmation.className="conf-closed");
        this.unselectDropdowns();
    }

    //Name[0], DNS Domain[1], Department[2], OS[7], Fireeye[14], Notes[12]
    setDataArrays(){
        //Set all the arrays to be empty
        this.BIOEArray = [];
        this.CHBEArray = [];
        this.CEEArray = [];
        this.ECEArray = [];
        this.EITArray = [];
        this.ENGRArray = [];
        this.FPEArray = [];
        this.IREAPArray = [];
        this.ISRArray = [];
        this.MATHArray = [];
        this.MSEArray = [];
        this.PHYSArray = [];
        this.allArray = [];
        this.windowsArray = [];
        this.macArray = [];
        this.linuxArray = [];
        this.osNotProvidedArray = [];
        this.fireeyeTrueArray = [];
        this.fireeyeFalseArray = [];
        this.repeats = [];

        const theData = appData.getData().Main;
        var id = 2;
        theData.forEach((row) => {
            //each element in any of the data arrays has an ID which is the row number in the spreadsheet, and values
            var newRow = {
                ID: id,
                Values: [row[0], row[1], row[2], row[7], row[14], row[12]]
            };
            id++;
            this.allArray.push(newRow);
            switch(row[2]){
                case 'BIOE':
                    this.BIOEArray.push(newRow);
                    break;
                case 'CHBE':
                    this.CHBEArray.push(newRow);
                    break;
                case 'CEE':
                    this.CEEArray.push(newRow);
                    break;
                case 'ECE':
                    this.ECEArray.push(newRow);
                    break;
                case 'EIT':
                    this.EITArray.push(newRow);
                    break;
                case 'ENGR':
                    this.ENGRArray.push(newRow);
                    break;
                case 'FPE':
                    this.FPEArray.push(newRow);
                    break;
                case 'IREAP':
                    this.IREAPArray.push(newRow);
                    break;
                case 'ISR':
                    this.ISRArray.push(newRow);
                    break;
                case 'MATH':
                    this.MATHArray.push(newRow);
                    break;
                case 'MSE':
                    this.MSEArray.push(newRow);
                    break;
                case 'PHYS':
                    this.PHYSArray.push(newRow);
                    break;
            };

            if(row[14] === 'TRUE'){
                this.fireeyeTrueArray.push(newRow);
            }else{
                this.fireeyeFalseArray.push(newRow);
            }

            if(row[7] === 'Mac'){
                this.macArray.push(newRow);
            }else if(row[7] === 'Windows'){
                this.windowsArray.push(newRow);
            }else if(row[7] === 'Linux'){
                this.linuxArray.push(newRow);
            }else{
                this.osNotProvidedArray.push(newRow)
            }
        });

        this.allArray.sort((el1, el2) => {
            if(el1.Values[0].localeCompare(el2.Values[0]) > 0){
                return 1;
            }else if(el1.Values[0].localeCompare(el2.Values[0]) === 0){
                if(this.repeats.find(el => el.ID === el1.ID) === undefined){
                    this.repeats.push(el1);
                }
                if(this.repeats.find(el => el.ID === el2.ID) === undefined){
                    this.repeats.push(el2);
                }
            }
            return -1;
        });
    }

    //This method handles the event in which an individual machine is searched
    machineSearch(){
        //console.log('search');
        this.removeCellListeners();
        const newTable = document.createElement('div');
        newTable.id = "table";
        var searchResult = [];
        this.allArray.forEach((row) => {
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
                    newCell.addEventListener('click', () => this.cellClicked(newRow), row);
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
                case dropdowns.DEPT:
                    this.clearDeptHandlers();
                    this.deptBut.style.backgroundColor = 'lightcoral';
                    this.currentDropdown = null;
                    this.hasDropdownSelected = false;
                    this.dropdownArea.innerHTML = '';
                    break;
                case dropdowns.OS:
                    this.clearOSHandlers();
                    this.osBut.style.backgroundColor = 'lightcoral';
                    this.currentDropdown = null;
                    this.hasDropdownSelected = false;
                    this.dropdownArea.innerHTML = '';
                    break;
                case dropdowns.FIREEYE:
                    this.clearFireeyeHandlers();
                    this.fireeyeBut.style.backgroundColor = 'lightcoral';
                    this.currentDropdown = null;
                    this.hasDropdownSelected = false;
                    this.dropdownArea.innerHTML = '';
                    break;
            }
        }
    }

    //The following three methods handle when you click on a dropdown. They have the same logic, but differ in contents since they handle different dropdowns
    deptDropdown(){
        //console.log("Dept Dropdown");
        if(this.hasDropdownSelected === true){ //If there is no dropdown selected, this is skipped

            //This switch is responsible for unselecting the currently selected dropdown in order to then select the new one
            switch(this.currentDropdown){
                case dropdowns.DEPT: //If you click on the currently selected dropdown, it will close
                    this.clearDeptHandlers();
                    this.deptBut.style.backgroundColor = 'lightcoral';
                    this.currentDropdown = null;
                    this.hasDropdownSelected = false;
                    this.dropdownArea.innerHTML = '';
                    return;
                case dropdowns.OS:
                    this.osBut.style.backgroundColor = 'lightcoral';
                    this.clearOSHandlers();
                    break;
                case dropdowns.FIREEYE:
                    this.fireeyeBut.style.backgroundColor = 'lightcoral';
                    this.clearFireeyeHandlers();
                    break;
            }
        }
        //The following code sets the new selected dropdown and changes to the appropriate contents of the dropdown area
        this.hasDropdownSelected = true;
        this.currentDropdown = dropdowns.DEPT;
        this.dropdownArea.innerHTML = `
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
        `
        this.addDeptHandlers();
        this.deptBut.style.backgroundColor = 'crimson';
    }
    osDropdown(){
        //console.log("OS Dropdown");
        if(this.hasDropdownSelected === true){
            switch(this.currentDropdown){
                case dropdowns.OS:
                    this.clearOSHandlers();
                    this.osBut.style.backgroundColor = 'lightcoral';
                    this.currentDropdown = null;
                    this.hasDropdownSelected = false;
                    this.dropdownArea.innerHTML = '';
                    return;
                case dropdowns.DEPT:
                    this.deptBut.style.backgroundColor = 'lightcoral';
                    this.clearDeptHandlers();
                    break;
                case dropdowns.FIREEYE:
                    this.fireeyeBut.style.backgroundColor = 'lightcoral';
                    this.clearFireeyeHandlers();
                    break;
            }
        }
        this.hasDropdownSelected = true;
        this.currentDropdown = dropdowns.OS;
        this.dropdownArea.innerHTML = `
        <div id="Linux">LINUX</div>
        <div id="Windows">WINDOWS</div>
        <div id="Mac">MAC</div>
        <div id="Other">OTHER</div>
        `
        this.addOSHandlers();
        this.osBut.style.backgroundColor = 'crimson';
    }
    fireeyeDropdown(){
        //console.log("Fireeye Dropdown");
        if(this.hasDropdownSelected === true){
            switch(this.currentDropdown){
                case dropdowns.FIREEYE:
                    this.clearFireeyeHandlers();
                    this.fireeyeBut.style.backgroundColor = 'lightcoral';
                    this.currentDropdown = null;
                    this.hasDropdownSelected = false;
                    this.dropdownArea.innerHTML = '';
                    return;
                case dropdowns.DEPT:
                    this.deptBut.style.backgroundColor = 'lightcoral';
                    this.clearDeptHandlers();
                    break;
                case dropdowns.OS:
                    this.osBut.style.backgroundColor = 'lightcoral';
                    this.clearOSHandlers();
                    break;
            }
        }
        this.hasDropdownSelected = true;
        this.currentDropdown = dropdowns.FIREEYE;
        this.dropdownArea.innerHTML = `
        <div id="True">TRUE</div>
        <div id="False">FALSE</div>
        `
        this.addFireeyeHandlers();
        this.fireeyeBut.style.backgroundColor = 'crimson';
    }

    //The next 6 methods add and remove event handlers to the newly added dropdown options from above. Ex. when you click on the Dept dropdown, a list of new options comes up.
    //The method addDeptHandlers will add event handlers for all of those options and clearDeptHandlers will remove them when the dropdown is unselected. The same applies for 
    //the other 2 dropdowns.
    addDeptHandlers(){
        //console.log("Adding Dept Handlers");
        this.shadowRoot.querySelector('#BIOE').addEventListener('click', () => {
            this.writeToData(filters.BIOE);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#CHBE').addEventListener('click', () => {
            this.writeToData(filters.CHBE);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#CEE').addEventListener('click', () => {
            this.writeToData(filters.CEE);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#ECE').addEventListener('click', () => {
            this.writeToData(filters.ECE);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#EIT').addEventListener('click', () => {
            this.writeToData(filters.EIT);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#ENGR').addEventListener('click', () => {
            this.writeToData(filters.ENGR);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#FPE').addEventListener('click', () => {
            this.writeToData(filters.FPE);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#IREAP').addEventListener('click', () => {
            this.writeToData(filters.IREAP);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#ISR').addEventListener('click', () => {
            this.writeToData(filters.ISR);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#MATH').addEventListener('click', () => {
            this.writeToData(filters.MATH);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#MSE').addEventListener('click', () => {
            this.writeToData(filters.MSE);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#PHYS').addEventListener('click', () => {
            this.writeToData(filters.PHYS);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
    }
    clearDeptHandlers(){
        //console.log("Removing Dept Handlers");
        this.shadowRoot.querySelector('#BIOE').removeEventListener('click', () => {
            this.writeToData(filters.BIOE);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#CHBE').removeEventListener('click', () => {
            this.writeToData(filters.CHBE);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#CEE').removeEventListener('click', () => {
            this.writeToData(filters.CEE);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#ECE').removeEventListener('click', () => {
            this.writeToData(filters.ECE);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#EIT').removeEventListener('click', () => {
            this.writeToData(filters.EIT);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#ENGR').removeEventListener('click', () => {
            this.writeToData(filters.ENGR);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#FPE').removeEventListener('click', () => {
            this.writeToData(filters.FPE);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#IREAP').removeEventListener('click', () => {
            this.writeToData(filters.IREAP);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#ISR').removeEventListener('click', () => {
            this.writeToData(filters.ISR);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#MATH').removeEventListener('click', () => {
            this.writeToData(filters.MATH);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#MSE').removeEventListener('click', () => {
            this.writeToData(filters.MSE);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#PHYS').removeEventListener('click', () => {
            this.writeToData(filters.PHYS);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
    }

    addOSHandlers(){
        //console.log("Adding OS Handlers");
        this.shadowRoot.querySelector('#Linux').addEventListener('click', () => {
            this.writeToData(filters.LINUX);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#Windows').addEventListener('click', () => {
            this.writeToData(filters.WINDOWS);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#Mac').addEventListener('click', () => {
            this.writeToData(filters.MAC);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#Other').addEventListener('click', () => {
            this.writeToData(filters.OSNOTPROVIDED);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
    }
    clearOSHandlers(){
        //console.log("Removing OS Handlers");
        this.shadowRoot.querySelector('#Linux').removeEventListener('click', () => {
            this.writeToData(filters.LINUX);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#Windows').removeEventListener('click', () => {
            this.writeToData(filters.WINDOWS);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#Mac').removeEventListener('click', () => {
            this.writeToData(filters.MAC);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#Other').removeEventListener('click', () => {
            this.writeToData(filters.OSNOTPROVIDED);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
    }

    addFireeyeHandlers(){
        //console.log("Adding Fireeye Handlers");
        this.shadowRoot.querySelector('#True').addEventListener('click', () => {
            this.writeToData(filters.FIREEYETRUE);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#False').addEventListener('click', () => {
            this.writeToData(filters.FIREEYEFALSE);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
    }
    clearFireeyeHandlers(){
        //console.log("Removing Fireeye Handlers");
        this.shadowRoot.querySelector('#True').removeEventListener('click', () => {
            this.writeToData(filters.FIREEYETRUE);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
        this.shadowRoot.querySelector('#False').removeEventListener('click', () => {
            this.writeToData(filters.FIREEYEFALSE);
            this.toggleOptionsClicked();
            this.unselectDropdowns();
        });
    }

    //This method sets the new data table based on the given filter
    writeToData(filter){
        this.removeCellListeners();
        var table;
        switch(filter){
            case filters.BIOE:
                table = this.loopThroughArray(this.BIOEArray);
                break;
            case filters.CHBE:
                table = this.loopThroughArray(this.CHBEArray);
                break;
            case filters.CEE:
                table = this.loopThroughArray(this.CEEArray);
                break;
            case filters.ECE:
                table = this.loopThroughArray(this.ECEArray);
                break;
            case filters.EIT:
                table = this.loopThroughArray(this.EITArray);
                break;
            case filters.ENGR:
                table = this.loopThroughArray(this.ENGRArray);
                break;
            case filters.FIREEYEFALSE:
                table = this.loopThroughArray(this.fireeyeFalseArray);
                break;
            case filters.FIREEYETRUE:
                table = this.loopThroughArray(this.fireeyeTrueArray);
                break;
            case filters.FPE:
                table = this.loopThroughArray(this.FPEArray);
                break;
            case filters.IREAP:
                table = this.loopThroughArray(this.IREAPArray);
                break;
            case filters.ISR:
                table = this.loopThroughArray(this.ISRArray);
                break;
            case filters.LINUX:
                table = this.loopThroughArray(this.linuxArray);
                break;
            case filters.MAC:
                table = this.loopThroughArray(this.macArray);
                break;
            case filters.MATH:
                table = this.loopThroughArray(this.MATHArray);
                break;
            case filters.MSE:
                table = this.loopThroughArray(this.MSEArray);
                break;
            case filters.OSNOTPROVIDED:
                table = this.loopThroughArray(this.osNotProvidedArray);
                break;
            case filters.PHYS:
                table = this.loopThroughArray(this.PHYSArray);
                break;
            case filters.WINDOWS:
                table = this.loopThroughArray(this.windowsArray);
                break;
            case filters.ALL:
                table = this.loopThroughArray(this.allArray);
                break;
            case filters.REPEATS:
                table = this.loopThroughArray(this.repeats);
                break;
        };

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

    //This method removes the event listeners from the data cells whenever the data table changes
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
        var row = Array(6);
        newRow.childNodes.forEach((node) => {
            row[index] = node;
            index++;
        });
        //console.log(row);
        this.formContainer.className = "form-open";
        this.formContainer.querySelector("#f-name").value = row[0].innerHTML;
        this.formContainer.querySelector("#f-dns").value = row[1].innerHTML;
        this.formContainer.querySelector("#f-dept").value = row[2].innerHTML;
        this.formContainer.querySelector("#f-os").value = row[3].innerHTML;
        this.formContainer.querySelector("#f-fireeye").value = row[4].innerHTML;
        this.formContainer.querySelector("#f-notes").value = row[5].innerHTML;
        this.rowCurrentSelected = {
            ID: rowFromArray.ID,
            Values: row
        };
    } 
    //Name[0], DNS Domain[1], Department[2], OS[7], Fireeye[14], Notes[12]
    submitRowChange(){
        //close the form and confirmation
        this.confirmation.className = "conf-closed";
        this.formContainer.className = "form-closed";

        //change the text of the cells in the data table to the new values
        this.rowCurrentSelected.Values[0].innerHTML = this.formContainer.querySelector("#f-name").value;
        this.rowCurrentSelected.Values[1].innerHTML = this.formContainer.querySelector("#f-dns").value;
        this.rowCurrentSelected.Values[2].innerHTML = this.formContainer.querySelector("#f-dept").value;
        this.rowCurrentSelected.Values[3].innerHTML = this.formContainer.querySelector("#f-os").value;
        this.rowCurrentSelected.Values[4].innerHTML = this.formContainer.querySelector("#f-fireeye").value;
        this.rowCurrentSelected.Values[5].innerHTML = this.formContainer.querySelector("#f-notes").value;

        //New array to hold the new new values with blank substituted for blank spaces
        const newValues = [
            this.formContainer.querySelector("#f-name").value === "" ? "blank" : this.formContainer.querySelector("#f-name").value,
            this.formContainer.querySelector("#f-dns").value === "" ? "blank" : this.formContainer.querySelector("#f-dns").value,
            this.formContainer.querySelector("#f-dept").value === "" ? "blank" : this.formContainer.querySelector("#f-dept").value,
            this.formContainer.querySelector("#f-os").value === "" ? "blank" : this.formContainer.querySelector("#f-os").value,
            this.formContainer.querySelector("#f-fireeye").value === "" ? "blank" : this.formContainer.querySelector("#f-fireeye").value,
            this.formContainer.querySelector("#f-notes").value === "" ? "blank" : this.formContainer.querySelector("#f-notes").value
        ];

        //Update the values in our appData object
        appData.getData().Main[this.rowCurrentSelected.ID - 2][0] = newValues[0];
        appData.getData().Main[this.rowCurrentSelected.ID - 2][1] = newValues[1];
        appData.getData().Main[this.rowCurrentSelected.ID - 2][2] = newValues[2];
        appData.getData().Main[this.rowCurrentSelected.ID - 2][7] = newValues[3];
        appData.getData().Main[this.rowCurrentSelected.ID - 2][14] = newValues[4];
        appData.getData().Main[this.rowCurrentSelected.ID - 2][12] = newValues[5];

        //Call our update method from our API
        appData.sendChange(`Main!A${this.rowCurrentSelected.ID}`, appData.getData().Main[this.rowCurrentSelected.ID - 2]);

        //Update our data arrays
        this.setDataArrays();
    }
}