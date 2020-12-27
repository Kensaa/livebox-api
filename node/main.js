const livebox = require("./livebox");

const target = 'E8:5A:8B:D6:64:BF';

async function main(){

    let loginRes = await livebox.login('192.168.1.1','admin','72mDptUw');
    console.log(loginRes.token);
    
    let options = {
        host:'192.168.1.1',
        token:loginRes.token,
        cookie:loginRes.cookie,
        info:{
            mac:target
        },
        loginRes:loginRes
    }

    livebox.toggleScheduler(options);
}
main();