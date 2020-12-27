const http = require("http");

async function login(address,user,pass){
    let request = {
        "service": "sah.Device.Information",
        "method": "createContext",
        "parameters": {
          "applicationName": "webui",
          "username": user,
          "password": pass
        }
    }
    let reqOptions = {
        hostname: address,
        path: "/ws",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "X-Sah-Login"
        }
      }
    return new Promise((resolve,reject)=>{
      http.request(reqOptions,res =>{
        let data = ""
        res.on("data", d => {
            data += d
        })
        res.on("end", () => {
            let json = JSON.parse(data);
            let token = json.data.contextID
            let cookie = Object.values(res.headers)[0][0].split(';')[0];
            let ret = {
              token:token,
              cookie:cookie
            }
            resolve(ret);
        })
      }).on("error", console.error)
        .end(JSON.stringify(request));

    });
}

async function getSchedulerRaw(options){
    let address = options.host;
    let token = options.token;
    let cookie = options.cookie;
    let mac = options.info.mac;


    let request = {
        "service": "Scheduler",
        "method": "getSchedule",
        "parameters": {
          "type": "ToD",
          "ID": `${mac}`
        }
      }
    let reqOptions = {
        hostname: address,
        path: "/ws",
        method: "POST",
        headers: {
          "authorization": `X-Sah ${token}`,
          "content-type": "application/x-sah-ws-4-call+json",
          "cookie":cookie
        }
      }
    return new Promise((resolve,reject)=>{
      http.request(reqOptions,res =>{
        let data = ""
        res.on("data", d => { 
            data += d
        })
        res.on("end", () => {
            let json = JSON.parse(data);
            resolve(json);
        })
      }).on("error", console.error)
        .end(JSON.stringify(request));
    });
}

async function getScheduleInfo(options){
  return new Promise(async(resolve,reject)=> {
    let res = await getSchedulerRaw(options);
    if(res.status = false){
      resolve(null);
    }else{
      resolve(res.data.scheduleInfo);
    }
  });
}

async function createScheduler(options){
  let address = options.host;
  let token = options.token;
  let cookie = options.cookie;
  let mac = options.info.mac;
  let state = options.info.state;

  let request = {
    "service": "Scheduler",
    "method": "addSchedule",
    "parameters": {
      "type": "ToD",
      "info": {
        "base": "Weekly",
        "def": "Enable",
        "ID": mac,
        "schedule": [],
        "enable": true,
        "override": state
      }
    }
  }
  let reqOptions = {
      hostname: address,
      path: "/ws",
      method: "POST",
      headers: {
        "authorization": `X-Sah ${token}`,
        "content-type": "application/x-sah-ws-4-call+json",
        "cookie":cookie
      }
    }
  return new Promise((resolve,reject)=>{
    http.request(reqOptions,res =>{
      let data = ""
      res.on("data", d => { 
          data += d
      })
      res.on("end", () => {
          let json = JSON.parse(data);
          resolve(json);
      })
    }).on("error", console.error)
      .end(JSON.stringify(request));
  });
}

async function overrideScheduler(options){
  let address = options.host;
  let token = options.token;
  let cookie = options.cookie;
  let mac = options.info.mac;
  let state = options.info.state;

  let request = {
    "service": "Scheduler",
    "method": "overrideSchedule",
    "parameters": {
      "type": "ToD",
      "ID": mac,
      "override": state
    }
  }
  let reqOptions = {
      hostname: address,
      path: "/ws",
      method: "POST",
      headers: {
        "authorization": `X-Sah ${token}`,
        "content-type": "application/x-sah-ws-4-call+json",
        "cookie":cookie
      }
    }
  return new Promise((resolve,reject)=>{
    http.request(reqOptions,res =>{
      let data = ""
      res.on("data", d => { 
          data += d
      })
      res.on("end", () => {
          let json = JSON.parse(data);
          resolve(json);
      })
    }).on("error", console.error)
      .end(JSON.stringify(request));
  });
}

async function changeState(options){
  let state = options.info.state 
  let schInfo = await getScheduleInfo(options)
  if(!schInfo){
    createScheduler(options)
  }else if(!schInfo.override == state){
    overrideScheduler(options);
  }

  
}

async function toggleScheduler(options){
  let scheduler = await getScheduleInfo(options);
  let currentState = scheduler.override.replace(' ','');
  let newState = (currentState == 'Enable' ? 'Disable' : 'Enable');
  options.info.state = newState;
  let overrideOptions = {
      host:'192.168.1.1',
      token:loginRes.token,
      cookie:loginRes.cookie,
      info:{
          mac:target,
          state:newState
      }
  }
  await changeState(overrideOptions);
}
module.exports = { login , getSchedulerRaw, getScheduleInfo, toggleScheduler, createScheduler,changeState, overrideScheduler};

