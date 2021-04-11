const livebox = require("./livebox");
const fs = require('fs')

const target = '34:14:5F:2D:AD:7B';

async function main(){

    let loginRes = await livebox.login('192.168.1.1','admin',process.env.livebox_password);
    //console.log(loginRes.token);
    
    /*let options = {
        host:'192.168.1.1',
        token:loginRes.token,
        cookie:loginRes.cookie,
        info:{
            internalPort:50705,
            externalPort:50705,
            destinationIPAddress:'192.168.1.69',
            id:'streamdeck',
            description:'streamdeck'
        },
    }*/
    let options = {
        host:'192.168.1.1',
        token:loginRes.token,
        cookie:loginRes.cookie,
        info:{
            mac:"30:E1:71:2E:18:01"
        },
    }

    let res = await livebox.getStaticIps(options);
    console.log(JSON.stringify(res));
    fs.writeFileSync('file.json',JSON.stringify(res))
}
main();