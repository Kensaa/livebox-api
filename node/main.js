const livebox = require("./livebox");



async function main(){

    let res = await livebox.login('192.168.1.1',process.env.livebox_user,process.livebox_password);
    let token = res.token;
    let cookie = res.cookie;
    //console.log(`token : ${token}`);
    let options = {
        host:'192.168.1.1',
        token:token,
        cookie:cookie,
        info:{
            mac:'D8:C4:6A:B5:EF:FD'
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