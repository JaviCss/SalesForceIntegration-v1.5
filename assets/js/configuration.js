import { serviceSalesforce } from "./modules/serviceSalesforce.js"
import { serviceZendesk } from "./modules/serviceZendesk.js"
//VARIABLES
let loader1 = $('#loader-pane #loader')
let loader2 = $('#loader-pane')
let groupsRequestAppropve = []
let groupsApprove = []
let client = ZAFClient.init()
//carga las variables con los datos del manifest
//y ejecuta los renders de cada grupo
client.metadata().then(metadata => {
  if (metadata.settings.requestApproveGroups !== 'null') {
    let group1 = metadata.settings.requestApproveGroups
    group1 = group1.split(',')
    group1.forEach(e => {
      groupsRequestAppropve.push(e)
    })
    rendergroup(group1)
  }
  if (metadata.settings.approveGroups !== 'null') {
    let group2 = metadata.settings.approveGroups
    group2 = group2.split(',')
    group2.forEach(e => {
      groupsApprove.push(e)
    })
    rendergroup2(group2)
  }
  if (metadata.settings.approvalProcess !== 'null') {
    let approvalProcess = metadata.settings.approvalProcess
    select(approvalProcess)
  } else {
    select('Not set')
  }
})

















// agrega los grupos al manifest
window.addGroup = function addGroup() {
  let groupsRequest = document.getElementById('select-groups').value
  if (!groupsRequestAppropve.includes(groupsRequest)) {
    groupsRequestAppropve.push(groupsRequest)
  }
  rendergroup(groupsRequestAppropve)
  setgroup(groupsRequestAppropve.join())
}
window.addGroup2 = function addGroup2() {
  let groupsRequest = document.getElementById('select-groups-2').value
  if (!groupsApprove.includes(groupsRequest)) {
    groupsApprove.push(groupsRequest)
  }
  rendergroup2(groupsApprove)
  setgroup2(groupsApprove.join())
}
//renders
function rendergroup(groupsRequestAppropve) {
  const groupsList = document.querySelector('.groups-request-list')
  groupsList.innerHTML = ''
  let i = 0
  groupsRequestAppropve.forEach(group => {
    const li = document.createElement('li')
    li.className = 'bundle-li'
    li.innerHTML = `
        <span class="w-75 pt-0 os-14 ps-2">${group}</span>
        <div class="btn-group dropdown w-25">
          <button type="button" class="btn-up dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></button>
          <ul class="dropdown-menu">
            <li><button class=" os-14 dropdown-item" onclick="removeGroupsRequestAppropve('${group}','${i}')" data-value="${i}" id="bundle-delete">Remove</button></li>
        </div>`
    groupsList.appendChild(li)
    i++
  })
}
function rendergroup2(groupsApprove) {
  const groupsList = document.querySelector('.groups-approval-list')
  groupsList.innerHTML = ''
  let i = 0
  groupsApprove.forEach(group => {
    const li = document.createElement('li')
    li.className = 'bundle-li'
    li.innerHTML = `
        <span class="w-75 os-14 pt-o ps-2">${group}</span>
        <div class="btn-group dropdown w-25">
          <button type="button" class="btn-up dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></button>
          <ul class="dropdown-menu">
            <li><button class="os-14 dropdown-item" onclick="removeGroupsAppropve('${group}','${i}')" data-value="${i}" id="bundle-delete">Remove</button></li>
        </div>`
    groupsList.appendChild(li)
    i++
  })
}
//elimina de los grupos
window.removeGroupsRequestAppropve = function removeGroupsRequestAppropve(name, i) {
  groupsRequestAppropve.splice(i, 1)
  setgroup(groupsRequestAppropve.join())
  rendergroup(groupsRequestAppropve)
}
window.removeGroupsAppropve = function removeGroupsAppropve(name, i) {
  groupsApprove.splice(i, 1)
  setgroup2(groupsApprove.join())
  rendergroup2(groupsApprove)
}
//setea en el manifest los grupos
function setgroup(requestApproveGroups) {
  if (requestApproveGroups.length === 0) {
    requestApproveGroups = 'null'
  }
  client.metadata().then(metadata => {
    let id = metadata.appId
    let settings2 = {
      url: '/api/v2/apps/installations.json?include=app',
      type: 'GET',
      dataType: 'json',
    }
    client.request(settings2).then(
      function (data) {
        data.installations.forEach(e => {
          if (e.app_id === id) {
            let settings = {
              url: `/api/v2/apps/installations/${e.id}`,
              type: 'PUT',
              data: {
                settings: {
                  requestApproveGroups: requestApproveGroups,
                },
              },
              dataType: 'json',
            }
            client.request(settings).then(
              function (data) {
                reload(client)
              },
              function (response) { }
            )
          }
        })
      },
      function (response) { }
    )
  })
}
function setgroup2(approveGroups) {
  if (approveGroups.length === 0) {
    approveGroups = 'null'
  }
  client.metadata().then(metadata => {
    let id = metadata.appId
    let settings2 = {
      url: '/api/v2/apps/installations.json?include=app',
      type: 'GET',
      dataType: 'json',
    }
    client.request(settings2).then(
      function (data) {
        data.installations.forEach(e => {
          if (e.app_id === id) {
            let settings = {
              url: `/api/v2/apps/installations/${e.id}`,
              type: 'PUT',
              data: {
                settings: {
                  approveGroups: approveGroups,
                },
              },
              dataType: 'json',
            }
            client.request(settings).then(
              function (data) {
                reload(client)
              },
              function (response) { }
            )
          }
        })
      },
      function (response) { }
    )
  })
}
function setapprovalProcess(approvalProcess) {
  client.metadata().then(metadata => {
    let id = metadata.appId
    let settings2 = {
      url: '/api/v2/apps/installations.json?include=app',
      type: 'GET',
      dataType: 'json',
    }
    client.request(settings2).then(
      function (data) {
        data.installations.forEach(e => {
          if (e.app_id === id) {
            let settings = {
              url: `/api/v2/apps/installations/${e.id}`,
              type: 'PUT',
              data: {
                settings: {
                  approvalProcess: approvalProcess,
                },
              },
              dataType: 'json',
            }
            client.request(settings).then(
              function (data) {
                setTimeout(() => {
                  $(' #loader').css('display', 'hidden').fadeOut(2000)
                }, 2000)
                reload(client)
              },
              function (response) { }
            )
          }
        })
      },
      function (response) { }
    )
  })
}
// muestra los botones seun el rol de usuario
client.get('currentUser').then(async function (data) {
  if (data['currentUser'].role === 'admin') {
  } else {
    $('#pills-credentials').addClass('hid')
    $('#pills-group').addClass('hid')
  }
})
let settings = {
  url: ' /api/v2/groups',
  type: 'GET',
  dataType: 'json',
}
client.request(settings).then(function (data) {
  data.groups.forEach(e => {
    //groups
    const option = document.createElement('option')
    const option2 = document.createElement('option')
    option2.value = e.name
    option2.innerHTML = e.name
    option.value = e.name
    option.innerHTML = e.name
    document.querySelector('#select-groups').appendChild(option)
    document.querySelector('#select-groups-2').appendChild(option2)
  })
})
//select('SP Approval In NetSuite')
// select approval process
function select(selectedValues) {
  for (const option of document.querySelectorAll('.custom-option')) {
    if (option.classList.contains('selected')) {
      option.classList.remove('selected')
    }
    if (option.textContent == selectedValues) {
      option.classList.add('selected')
    } else {
      document.querySelector('#default').classList.add('selected')
      document.querySelector('.custom-select__trigger span').textContent =
        selectedValues
    }
  }
}
document.querySelector('.custom-select-wrapper').addEventListener('click', function () {
  this.querySelector('.custom-select').classList.toggle('open')
})
for (const option of document.querySelectorAll('.custom-option')) {
  option.classList.remove('selected')
  option.addEventListener('click', function () {
    if (!this.classList.contains('selected')) {
      for (const option of document.querySelectorAll('.custom-option')) {
        option.classList.remove('selected')
      }

      this.classList.add('selected')
      this.closest('.custom-select').querySelector(
        '.custom-select__trigger span'
      ).textContent = this.textContent
      $('#loader').css('opacity', '1')
      setapprovalProcess(this.textContent)
    }
  })
}
window.addEventListener('click', function (e) {
  const select = document.querySelector('.custom-select')
  if (!select.contains(e.target)) {
    select.classList.remove('open')
  }
})
setTimeout(() => {
  loader1.addClass('loader1')
  loader2.addClass('loader-pane1')
  renderAccount()
}, 2000)
function renderAccount() {
  let accContainer = '' //document.querySelector('#acc-container')
  // accContainer.innerHTML = ''

  client.metadata().then(async function (metadata) {
    // console.log(metadata)
    let id = metadata.appId
    let settings2 = {
      url: '/api/v2/apps/installations.json?include=app',
      type: 'GET',
      dataType: 'json',
    }
    await client.request(settings2).then(
      function (data) {
        data.installations.forEach(e => {
          if (e.app_id === id) {
            let settings = {
              url: `/api/v2/apps/installations/${e.id}`,
              type: 'PUT',
              dataType: 'json',
            }
            client.request(settings).then(
              async function (data) {
                //console.log(data)
                await data.settings_objects.forEach(element => {
                  for (let i = 1; i < 6; i++) {
                    if (createArrAcount(i).includes(element.name)) {
                      let arr = createArrAcount(i)
                      if (element.value !== null) {
                        if (element.name === arr[0]) {
                          let div = document.createElement('div')
                          div.className = 'col-4'
                          div.innerHTML = `
                                                            <div class="acc-ns">
                                                                <h2 class="os-16 p-0 mt-auto mb-2 fw-bold ">Account ${i}</h2>
                                                                <h2 class="os-14 p-0 mb-auto fw-bold">${element.value}</h2>
                                                                <div class="btn-acc dropdown w-25">
                                                                    <button type="button" class="btn-config dropdown-toggle" data-bs-toggle="dropdown"
                                                                    aria-expanded="false"></button>
                                                                    <ul class="dropdown-menu">
                                                                        <li><button class=" os-14 dropdown-item" onclick="removeAccount('${i}')" data-value=""
                                                                        id="acc-delete">Remove account</button>
                                                                    </li>
                                                                </div>
                                                            </div>  `
                          accContainer.appendChild(div)
                        }
                      }
                    }
                  }
                })
                $('#loader-pane #loader')
                  .removeClass('loader1')
                  .trigger('enable')
                $('#loader-pane').removeClass('loader-pane1')
              },
              function (response) { }
            )
          }
        })
      },
      function (response) { }
    )
  })
  function createArrAcount(i) {
    let arrCredentials = []
    arrCredentials.push(`AccountId${i}`)
    arrCredentials.push(`ConsumerKey${i}`)
    arrCredentials.push(`ConsumerSecret${i}`)
    arrCredentials.push(`TokenId${i}`)
    arrCredentials.push(`TokenSecret${i}`)
    return arrCredentials
  }
}

function reload(client) {
  var topBarClientPromise = client
    .get('instances')
    .then(function (instancesData) {
      var instances = instancesData.instances
      for (var instanceGuid in instances) {
        if (instances[instanceGuid].location === 'ticket_sidebar') {
          return client.instance(instanceGuid)
        }
      }
    })
  topBarClientPromise.then(function (topBarClient) {
    topBarClient.trigger('reload')
  })
}

//cookies
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
//oauth

$('#start-auth').click(async () => {
  let urlDomain = await serviceSalesforce.setCredencials(client)
  console.log(urlDomain)
})

//link
async function startAuth(client) {
  let settings = {
    url: `/api/v2/organizations`,
    type: 'get',
    dataType: 'json',
  }
  let urlDomain = await client.request(settings).then(function (data) {
    return data.organizations[0].url
  })
  let url = new URL(urlDomain)
  client.invoke('notify', 'Authenticating...');
  //client.get('ticket.id').then(
  // function(data) {
  // var ticket_id = data['ticket.id'];
  var source = $("#start_auth-hdbs").html();
  var template = Handlebars.compile(source);
  var html = template({ domain: url.host });
  $("#content").html(html);
  //});
}

//iframe

$('#check-token').click(function () {
  startAuth(client)
})
$(window).on("message", function (event) {
  var origin = event.origin || event.originalEvent.origin;
  if (origin !== "https://server-sf.herokuapp.com")
    return;
  var msg = event.data || event.originalEvent.data;
  if (msg.token == 'undefined') {
    console.log('token undefined')
    showStart();
    //startAuth(client);
  } else {
    console.log(msg.token)
    console.log(msg.instance_url)

    let sheet = msg.token

    // showForm(msg.token, client);
    // console.log('Autentificado')
  }
});









///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////







