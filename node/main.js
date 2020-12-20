const livebox = require("./livebox");



async function main(){

    let res = await livebox.login('192.168.1.1','admin','72mDptUw');
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
    console.log(`scheduler : ${JSON.stringify(scheduler)}`);
    
    


}
main();