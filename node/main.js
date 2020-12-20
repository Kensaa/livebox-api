const livebox = require("./livebox");

const target = 'D8:C4:6A:B5:EF:FD';

async function main(){

    let loginRes = await livebox.login('192.168.1.1',process.env.livebox_user,process.livebox_password);
    
    let options = {
        host:'192.168.1.1',
        token:loginRes.token,
        cookie:loginRes.cookie,
        info:{
            mac:target
        }
    }

    let scheduler = await livebox.getScheduleInfo(options);
    let newState = "Enable";
    if(scheduler.override == "Disable"){
        newState = "Enable";
    }else if(scheduler.override == "Enable"){
        newState = "Disable";
    }
    
    let options2 = options;
    options2.info.state = newState;
    livebox.toggleScheduler(options2);
    


}
main();