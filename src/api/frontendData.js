class AppData{
    constructor(){
        this.data = null;
    }
    setData(dataPayload){
        this.data = dataPayload;
    }
    getData(){
        return this.data;
    }
    sendChange(range, row){
        window.api.updateResponse("updateResponse", (response) => {
            console.log(`Received ${response} from main process`);
        });
        window.api.updateRequest("updateRequest", range, row);
    }
}

const appData = new AppData();

export default appData;