
//IMPORTS
import { serviceSalesforce } from "./modules/serviceSalesforce.js"
import { serviceZendesk } from "./modules/serviceZendesk.js"
//VARIABLES

let existingCustomizations = []
let existingDataRecords = []
let proposedCustomizations = []
let proposedDataRecords = []


let ticketNumber
let ticketSubject
let ticketDescription
let ticketStatus
let linkCR
let bundleID = 0
let crId
let userData = ''
let client = ZAFClient.init()

$('#info #loader').addClass('loader')
$('#info #loader-pane').addClass('loader-pane')
client.invoke('resize', { width: '100%', height: '900px' })

client.on('reload', function () {
  console.log('reload')
  setTimeout(() => {
    start(client)
  }, 1300)
})
client.on('reloadApp', function () { 
  start(client)
  console.log('reloadApp')
})
start(client)


///////////////////////////////////////////////////////////////////////////////////
async function start(client) {
  //localStorage.clear();
  serviceSalesforce.getName(client, Handlebars)
  userData = await serviceZendesk.getCurrentUser(client)
  let ticketObj = await serviceZendesk.getTicketInfo(client)
  let manifestInfo = await serviceZendesk.getManifestInfo(client)
  let requestApproveGroups = manifestInfo.requestApproveGroups
  let approverGroups = manifestInfo.approverGroups
  let approvalProcess = manifestInfo.approvalProcess
  let isOperator, isAdministrator
  ticketNumber = ticketObj.ticketNumber
  ticketSubject = ticketObj.ticketSubject
  ticketDescription = ticketObj.ticketDescription
  ticketStatus = ticketObj.ticketStatus
  requestApproveGroups = requestApproveGroups.split(',')
  approverGroups = approverGroups.split(',')
  approvalProcess = approvalProcess.split(',')
  userData?.groups.forEach(e => {
    if (requestApproveGroups.includes(e.name)) {
      isOperator = requestApproveGroups.includes(e.name)
      return
    }
  })
  userData?.groups.forEach(e => {
    if (approverGroups.includes(e.name)) {
      isAdministrator = approverGroups.includes(e.name)
      return
    }
  })
  showHome()
  document.getElementById('btn-request').style.display = 'none'
  document.getElementById('btn-approved').style.display = 'none'
  document.getElementById('btn-reject').style.display = 'none'
  document.getElementById('btn-close-status').style.display = 'none'
  document.getElementById('btn-push').style.display = 'none'
  getCustomizations(isOperator, isAdministrator, approvalProcess)
}

async function getCustomizations(isOperator, isAdministrator, approvalProcess) {
  console.log('getCustomizations')
 
  let ticketObj = await serviceSalesforce.getTicket(client)
  let ticketNumber = ticketObj.ticketNumber


  let getCustom
  await serviceSalesforce.getCustomization(client, Handlebars)
  let myInterval = setInterval(() => {
    if (JSON.parse(localStorage.getItem(`ticketData-${ticketNumber}`)) === null) { } else {
      getCustom = JSON.parse(localStorage.getItem(`ticketData-${ticketNumber}`))
      if (getCustom === null) {
        // 
      } else {
        getCustom = getCustom.data
        if (getCustom.recordType !== null) {
          //INFO
          $('#policy').text(getCustom.policy)
          $('#level').text(getCustom.changeLevelReq)
          $('#linkCR').attr("href", getCustom.crURL)
          if (getCustom.ApprovalStatus === null) {
            document.querySelector('#statusNS').textContent = 'N/S'
          } else {
            document.querySelector('#statusNS').textContent = getCustom.ApprovalStatus
          }

          if (isOperator && ['', 'Not Started', 'In Progress'].includes(getCustom.completionStatus) &&
            ['SP Approval In Zendesk', 'SP Approval In Salesforce'].includes(approvalProcess[0]) && true) {
            document.getElementById('btn-request').style.display = 'flex'
            // document.getElementById('btn-reject').style.display = 'flex';
          }
          if (isAdministrator && getCustom.completionStatus === 'Pending Approval' &&
            ['SP Approval In Zendesk'].includes(approvalProcess[0]) && true) {
            document.getElementById('btn-approved').style.display = 'flex'
            document.getElementById('btn-reject').style.display = 'flex'
          }
          // close
          if (isAdministrator && getCustom.completionStatus === 'Approved' &&
            ['SP Approval In Zendesk', 'No Approval Needed'].includes(approvalProcess[0]) && true) {
            document.getElementById('btn-close-status').style.display = 'flex'
          }
          // push
          if (isAdministrator && !['Completed', 'Rejected', 'Cancelled', 'Approved'].includes(
            getCustom.completionStatus) && ['No Approval Needed'].includes(approvalProcess[0]) && true) {
            document.getElementById('btn-push').style.display = 'flex'
          }
          //## RENDERS
          renderExistingCustomizations()
          renderProposedCustomizations()
          renderExistingDataRecord()
          renderProposedDataRecord()
          removeLoader()


        } else {
          document.querySelector('#statusNS').textContent = 'NOT EXIST IN SF'
          client.invoke('notify', 'This ticket dont exist in Salesforce, Please add some record .. ;)','alert',5000);
         //notifications('primary', 'This ticket dont exist in Salesforce, Please add some record .. ;)', 5000)
         // createCr()
          console.log('no existe Chr')
          removeLoader()
          //start()
        }
      }
      clearInterval(myInterval)
    }
  }, 700);
}

//MODAL CLIENTE
async function popModal(url, h) {
  let ticketObj = await serviceSalesforce.getTicket(client)
  await localStorage.setItem('ticketObj',JSON.stringify(ticketObj))

  client.invoke('instances.create', {
    location: 'modal',
    url: url,
    size: { width: '750px', height: h },
  })
    .then(function (modalContext) {
      // The modal is on the screen now!
      var modalClient = client.instance(
        modalContext['instances.create'][0].instanceGuid
      )
      //client.on('instance.registered', function () { })
      modalClient.on('modal.close', function () {
        start(client)
        /*
        
        if (localStorage.getItem('selectedCustomizationValues')) {
          renderExistingCustomizations()
          start(client)
        }
        if (localStorage.getItem('ProposedCustomization')) {
          renderProposed()
          start(client)
        }*/
        // The modal has been closed.
      })
    })
}
/*SHOW HOME */
function showHome() {
  let requester_data = {}
  let source = $('#home-template').html()
  let template = Handlebars.compile(source)
  let html = template(requester_data)
  $('#home').html(html)

  //proposedCustomization
  $('#existingCustomizations').click(() => {
    popModal('assets/modalExistingCustomization.html', '440')
  })
  $('#proposedCustomization').click(() => {
    popModal('assets/modalProposedCustomization.html', '240')
  })
  $('#existingDataRecord').click(() => {
    popModal('assets/modalExistingDataRecord.html', '440')
  })
  $('#proposedDataRecord').click(() => {
    popModal('assets/modalProposedDataRecord.html', '240')
  })
  /*
    let btn4 = document.getElementById('btn-impact')
    btn4.addEventListener('click', () => {
      popModal('assets/modalImpact.html', '550')
    })*/
}
//RENDERS
async function renderExistingCustomizations() {
  let ticketObj = await serviceSalesforce.getTicket(client)
  let ticketNumber = ticketObj.ticketNumber
  let existingList = document.querySelector('.existing-Customizations')
  existingList.innerHTML = ''
  let selectedCustomizationValues = JSON.parse(localStorage.getItem(`ticketData-${ticketNumber}`)).data.existingCustomizations
  if (selectedCustomizationValues.length > 0) {
    selectedCustomizationValues.forEach(item => {
      const url = ``
      const li = document.createElement('li')
      li.className = 'bundle-li'
      li.innerHTML = `      
      <span class="w-75 ps-2">${item.name}</span>
        <div class="btn-group dropdown w-25">
          <button type="button" class="btn-up dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></button>
          <ul class="dropdown-menu">
            <li><button class="dropdown-item" onclick="clickDeleteLookup('${item.internalId}', '${item.name}')" id="bundle-delete">Remove</button></li>
            <li> 
            <a target="_blank" onclick="erd('${url}')">
            <button class="dropdown-item" id="ver-erd" disabled >ERD</button>
            </a>
            </li>
            </div>`
      existingList.appendChild(li)
    })
    removeLoader()
  }


}
async function renderProposedCustomizations() {
  let ticketObj = await serviceSalesforce.getTicket(client)
  let ticketNumber = ticketObj.ticketNumber
  let bundleLista = document.querySelector('.proposed-lista')
  bundleLista.innerHTML = ''
  let proposedCustomizations = JSON.parse(localStorage.getItem(`ticketData-${ticketNumber}`)).data.proposedCustomizations
  let i = 0
  if (proposedCustomizations !== null) {
    proposedCustomizations = proposedCustomizations.split('\n')
    proposedCustomizations.forEach(item => {
      const li = document.createElement('li')
      li.className = 'bundle-li'
      li.innerHTML = `      
      <span class="w-75 ps-2">${item}</span>
      <div class="btn-group dropdown w-25">
      <button type="button" class="btn-up dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></button>
      <ul class="dropdown-menu">
            <li><button class="dropdown-item" onclick="clickDeleteProposed('${item}')" data-value="${i}" id="bundle-delete">Remove</button></li>
            </div>`
      bundleLista.appendChild(li)
      i++
    })
  }


}
async function renderExistingDataRecord() {
  let ticketObj = await serviceSalesforce.getTicket(client)
  let ticketNumber = ticketObj.ticketNumber
  let existingList = document.querySelector('.existingDataRecord')
  existingList.innerHTML = ''
  let selectedCustomizationValues = JSON.parse(localStorage.getItem(`ticketData-${ticketNumber}`)).data.existingDataRecords
  if (selectedCustomizationValues.length > 0) {
    selectedCustomizationValues.forEach(item => {
      const url = ``
      const li = document.createElement('li')
      li.className = 'bundle-li'
      li.innerHTML = `      
      <span class="w-75 ps-2">${item.dataRecordName} - (${item.sobjectApiName})</span>
        <div class="btn-group dropdown w-25">
          <button type="button" class="btn-up dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></button>
          <ul class="dropdown-menu">
            <li><button class="dropdown-item" onclick="deleteExistingDataRecord('${item.dataRecordName}','${item.sobjectApiName}','${item.dataRecordId}')" id="bundle-delete">Remove</button></li>
            <li> 
            <a target="_blank" onclick="erd('${url}')">
            <button class="dropdown-item" id="ver-erd" disabled >ERD</button>
            </a>
            </li>
            </div>`
      existingList.appendChild(li)
    })
    removeLoader()
  }


}
async function renderProposedDataRecord() {
  let ticketObj = await serviceSalesforce.getTicket(client)
  let ticketNumber = ticketObj.ticketNumber
  let bundleLista = document.querySelector('.proposedDataRecord')
  bundleLista.innerHTML = ''
  let proposedCustomizations = JSON.parse(localStorage.getItem(`ticketData-${ticketNumber}`)).data.proposedDataRecords
  let i = 0

  proposedCustomizations.forEach(item => {
    const li = document.createElement('li')
    li.className = 'bundle-li'
    li.innerHTML = `      
      <span class="w-75 ps-2">${item.dataRecordName} (${item.sobjectApiName})</span>
      <div class="btn-group dropdown w-25">
      <button type="button" class="btn-up dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></button>
      <ul class="dropdown-menu">
            <li><button class="dropdown-item" onclick="deleteProposedDataRecord('${item.dataRecordName}', ${item.sobjectApiName})" data-value="${i}" id="bundle-delete">Remove</button></li>
            </div>`
    bundleLista.appendChild(li)
    i++
  })
}

//DELETES
window.clickDeleteLookup = async function clickDeleteLookup(existingId, existingName) {
  // $('#existing-customizations.bundle-id-lista #loader').addClass('loader')
  //$('#existing-customizations.bundle-id-lista #loader-pane').addClass('loader-pane')
  let deleteExistingCustomization = await serviceSalesforce.deleteExistingCustomization(client, Handlebars, existingId, existingName)
 
}
window.clickDeleteProposed = async function clickDeleteProposed(item) {
  // $('#existing-customizations.bundle-id-lista #loader').addClass('loader')
  //$('#existing-customizations.bundle-id-lista #loader-pane').addClass('loader-pane')
  let deleteProposedCustomization = await serviceSalesforce.deleteProposedCustomization(client, Handlebars, item)
  
 
}
window.clickDeleteExistingDataRecord = async function clickDeleteExistingDataRecord(dataRecordName, sobjectApiName,dataRecordId) {
  // $('#existing-customizations.bundle-id-lista #loader').addClass('loader')
  //$('#existing-customizations.bundle-id-lista #loader-pane').addClass('loader-pane')
  let deleteExistingCustomization = await serviceSalesforce.deleteExistingDataRecord(client, Handlebars, dataRecordName, sobjectApiName,dataRecordId)
  
}
window.clickDeleteProposedDataRecord = async function clickDeleteProposedDataRecord(dataRecordName,sobjectApiName) {
  // $('#existing-customizations.bundle-id-lista #loader').addClass('loader')
  //$('#existing-customizations.bundle-id-lista #loader-pane').addClass('loader-pane')
  let deleteExistingCustomization = await serviceSalesforce.deleteProposedDataRecord(client, Handlebars, sobjectApiName, dataRecordName)
 
}

//CHANGE STATUS
window.changeStatus = async function changeStatus(action) {
  switch (action) {
    case 'request':
      updateTicketStatus('In Progress', 'Pending Approval')
      break
    case 'approved':
      updateTicketStatus('In Progress', 'Approved')
      break
    case 'Complete':
      updateTicketStatus('Completed', 'Approved')
      break
    case 'Push':
      updateTicketStatus('Closed')
      break
    case 'Rejected':
      updateTicketStatus('rejected')
      break
    default:
      break
  }
}
async function updateTicketStatus(currentStatus, approvalStatus) {
  let setUpdateTicketStatus = await serviceSalesforce.setUpdateTicketStatus(client, currentStatus, approvalStatus)

  
}

async function createCr(params) {
  const obj = {
    proposedDataRecords: [],
    proposedCustomizations: [],
    existingDataRecords: [],
    existingCustomizations: [],
    currentStatus: '',
    approvalStatus: ''
  }
  let ticketObj = await serviceSalesforce.getTicket(client)
  let ticketNumber = ticketObj.ticketNumber
 
  //let data = JSON.parse(localStorage.getItem(`ticketData-${ticketNumber}`)).data

  obj.proposedDataRecords = []
  obj.proposedCustomizations = []
  obj.existingDataRecords = []
  obj.existingCustomizations = []
  //obj.currentStatus = data.completionStatus
  //obj.approvalStatus = data.ApprovalStatus 

  let postCustomization = await serviceSalesforce.postCustomization(client, Handlebars, obj, false, true)

}

//UTYLITIES
function removeLoader() {
  if ($(`#info #loader`)) {
    $(`#info #loader`).removeClass('loader').trigger('enable')
    $('#info #loader-pane').removeClass('loader-pane')
  }


  $('#existing-customizations.bundle-id-lista #loader').removeClass('loader').trigger('enable')
  $('#existing-customizations.bundle-id-lista #loader-pane').removeClass('loader-pane')

  $(`#bundle-id.bundle-id-lista #loader`).removeClass('loader').trigger('enable')
  $('#bundle-id.bundle-id-lista #loader-pane').removeClass('loader-pane')

  $(`#proposed-customizations #loader`).removeClass('loader').trigger('enable')
  $('#proposed-customizations #loader-pane').removeClass('loader-pane')
}

function getTicket() {
  return client.get('ticket').then(async function (data) {
      let userData = await getCurrentUser(client)
      let ticketNumber = data.ticket.id.toString()
      const obj = {
          userData: userData,
          userName: userData?.name,
          ticketNumber: ticketNumber,
          ticketSubject: data.ticket.subject,
          ticketDescription: data.ticket.description,
          ticketStatus: data.ticket.status,
          urlticket: `${data.ticket.brand.url}/agent/tickets/${ticketNumber}`,
          urlDomain: data.ticket.brand.url
      }
      return obj
  })
}
function getCurrentUser() {
  return client.get('currentUser').then(async function (data) {
      return data['currentUser']
  })
}


