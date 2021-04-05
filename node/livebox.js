const http = require("http");

async function request(req,reqOptions){
  return new Promise((resolve,reject)=>{
    http.request(reqOptions,res =>{
      let data = ""
      res.on("data", d => {
          data += d
      })
      res.on("end", () => {
          let r = {
            headers: res.headers,
            data: data
          }
          resolve(r);
      })
    }).on("error",(e)=>{
      console.error(e);
      reject(e);
    }).end(JSON.stringify(req));
  });
}

async function login(address,user,pass){
    let req = {
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
        request(req,reqOptions).then((data) =>{
        let json = JSON.parse(data.data);
        let token = json.data.contextID
        let cookie = Object.values(data.headers)[0][0].split(';')[0];
        let ret = {
          token:token,
          cookie:cookie
        }
        resolve(ret);
      })
      
      });
}

async function getSchedulerRaw(options){
    let address = options.host;
    let token = options.token;
    let cookie = options.cookie;
    let mac = options.info.mac;


    let req = {
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
      request(req,reqOptions).then((data)=>{
        let json = JSON.parse(data.data);
        resolve(json);
      });
    });
}

async function getScheduleInfo(options){
  return new Promise((resolve,reject)=> {
    getSchedulerRaw(options).then((res)=>{
      if(res.status = false){
        resolve(null);
      }else{
        resolve(res.data.scheduleInfo);
      }
    });
  });
}

async function createScheduler(options){
  let address = options.host;
  let token = options.token;
  let cookie = options.cookie;
  let mac = options.info.mac;
  let state = options.info.state;

  let req = {
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
    request(req,reqOptions).then((data) =>{
      let json = JSON.parse(data.data);
      resolve(json);
    });
    
  });
}

async function overrideScheduler(options){
  let address = options.host;
  let token = options.token;
  let cookie = options.cookie;
  let mac = options.info.mac;
  let state = options.info.state;

  let req = {
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
      request(req,reqOptions).then((data) =>{
        let json = JSON.parse(data.data);
        resolve(json);
      });
      
    });
}

async function changeSchedulerState(options){
  let state = options.info.state 
  let schInfo = await getScheduleInfo(options)
  if(!schInfo){
    await createScheduler(options)
  }else if(schInfo.override.replace(' ','') != state){
    await overrideScheduler(options);
  }
}

async function toggleScheduler(options){
  let scheduler = await getScheduleInfo(options);
  let currentState = scheduler.override.replace(' ','');
  let newState = (currentState == 'Enable' ? 'Disable' : 'Enable');
  let overrideOptions = {
      host:'192.168.1.1',
      token:options.token,
      cookie:options.cookie,
      info:{
          mac:options.info.mac,
          state:newState
      }
  }
  await changeSchedulerState(overrideOptions);
}

async function getWanStatus(options){
  let req = {
    "service": "NMC",
    "method": "getWANStatus",
    "parameters": {}
  }
  let reqOptions = {
    hostname: options.host,
    path: "/ws",
    method: "POST",
    headers: {
      "authorization": `X-Sah ${options.token}`,
      "content-type": "application/x-sah-ws-4-call+json",
      "cookie":options.cookie
    }
  }

  return new Promise((resolve,reject)=>{
    request(req,reqOptions).then((data) =>{
      let json = JSON.parse(data.data);
      resolve(json);
    });
  });

}

async function getWanSpeed(options){
  let req = {
    "service": "NeMo.Intf.data",
    "method": "getMIBs",
    "parameters": {
      "mibs": "dsl"
    }
  }
  let reqOptions = {
    hostname: options.host,
    path: "/ws",
    method: "POST",
    headers: {
      "authorization": `X-Sah ${options.token}`,
      "content-type": "application/x-sah-ws-4-call+json",
      "cookie":options.cookie
    }
  }

  return new Promise((resolve,reject)=>{
    request(req,reqOptions).then((data) =>{
      let json = JSON.parse(data.data);
      resolve(json);
    });
  });
}

async function restart(options){
  let req = {
    "service": "NMC",
    "method": "reboot",
    "parameters": {
      "reason": "GUI_Reboot"
    }
  };

  let reqOptions = {
    hostname: options.host,
    path: "/ws",
    method: "POST",
    headers: {
      "authorization": `X-Sah ${options.token}`,
      "content-type": "application/x-sah-ws-4-call+json",
      "cookie":options.cookie
    }
  }

  return new Promise((resolve,reject)=>{
    request(req,reqOptions).then((data) =>{
      let json = JSON.parse(data.data);
      resolve(json);
    });
  });
}

async function getDevicesRaw(options){
  let req = {
    "service": "Devices",
    "method": "get",
    "parameters": {
      "expression": {
        "ETHERNET": "not interface and not self and eth and .Active==true",
        "WIFI": "not interface and not self and wifi and .Active==true"
      }
    }
  };
  let reqOptions = {
    hostname: options.host,
    path: "/ws",
    method: "POST",
    headers: {
      "authorization": `X-Sah ${options.token}`,
      "content-type": "application/x-sah-ws-4-call+json",
      "cookie":options.cookie
    }
  }
  return new Promise((resolve,reject)=>{
    request(req,reqOptions).then((data) =>{
      let json = JSON.parse(data.data);
      resolve(json);
    });
  });
}

async function getDeviceDetail(options){
  let req = {
    "service": "Devices.Device."+options.info.mac,
    "method": "get",
    "parameters": {}
  };
  let reqOptions = {
    hostname: options.host,
    path: "/ws",
    method: "POST",
    headers: {
      "authorization": `X-Sah ${options.token}`,
      "content-type": "application/x-sah-ws-4-call+json",
      "cookie":options.cookie
    }
  }
  return new Promise((resolve,reject)=>{
    request(req,reqOptions).then((data) =>{
      let json = JSON.parse(data.data);
      resolve(json);
    });
  });
}

async function getPortForwarding(options){
  let req = {
    "service": "Firewall",
    "method": "getPortForwarding",
    "parameters": {
      "origin": "webui"
    }
  };
  let reqOptions = {
    hostname: options.host,
    path: "/ws",
    method: "POST",
    headers: {
      "authorization": `X-Sah ${options.token}`,
      "content-type": "application/x-sah-ws-4-call+json",
      "cookie":options.cookie
    }
  }
  return new Promise((resolve,reject)=>{
    request(req,reqOptions).then((data) =>{
      let json = JSON.parse(data.data);
      resolve(json);
    });
  });
}

async function setPortForwarding(options){
  let req = {
    "service": "Firewall",
    "method": "setPortForwarding",
    "parameters": {
      "id": options.info.id,
      "internalPort": options.info.internalPort,
      "externalPort": options.info.externalPort,
      "destinationIPAddress": options.info.destinationIPAddress,
      "enable": true,
      "persistent": true,
      "protocol": "6",
      "description": options.info.description,
      "sourceInterface": "data",
      "origin": "webui",
      "destinationMACAddress": ""
    }
  };
  let reqOptions = {
    hostname: options.host,
    path: "/ws",
    method: "POST",
    headers: {
      "authorization": `X-Sah ${options.token}`,
      "content-type": "application/x-sah-ws-4-call+json",
      "cookie":options.cookie
    }
  }
  return new Promise((resolve,reject)=>{
    request(req,reqOptions).then((data) =>{
      let json = JSON.parse(data.data);
      resolve(json);
    });
  });
}

module.exports = {login, getSchedulerRaw, getScheduleInfo, toggleScheduler, changeSchedulerState, overrideScheduler, getWanStatus, getWanSpeed, restart, getDevicesRaw, getDeviceDetail, getPortForwarding, setPortForwarding};

