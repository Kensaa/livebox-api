const livebox = require("./livebox");

const target = '34:14:5F:2D:AD:7B';

async function main(){

    let loginRes = await livebox.login('192.168.1.1','admin','72mDptUw');
    //console.log(loginRes.token);
    
    let options = {
        host:'192.168.1.1',
        token:loginRes.token,
        cookie:loginRes.cookie,
        info:{
            mac:target
        },
    }

    let res = await livebox.getDeviceDetail(options);
    console.log(JSON.stringify(res));
}
main();