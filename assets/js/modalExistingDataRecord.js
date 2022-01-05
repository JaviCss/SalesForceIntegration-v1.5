//IMPORTS
import { serviceSalesforce } from "./modules/serviceSalesforce.js"
import { serviceZendesk } from "./modules/serviceZendesk.js"
//VARIABLES
var client = ZAFClient.init()
getSelects(client, Handlebars)
//SUBMIT
document.querySelector('#modal').addEventListener('submit', (e) => {
  document.querySelector('#modal').classList.add('colapse')
  document.querySelector('.header').classList.add('colapse')
  document.querySelector('.header2').classList.add('visible')
  document.querySelector('.header2').classList.remove('colapse')
  document.querySelector('.header').classList.add('pb-0')
  document.querySelector('.header').classList.remove('pb-4')
  document.querySelector('.look-list').classList.remove('colapse')
  event.preventDefault()
  submitData()
})

async function getSelects(client, Handlebars) {
  let trackedObject = await serviceSalesforce.getTrackedObject(client, Handlebars)
  removeLoader()
}

async function submitData() {
  $(' #loader').addClass('loader')
  $(' #loader-pane').addClass('loader-pane')
  // //addCostumization propose NS
  //let accountId = await serviceZendesk.getNsClietId(client)
  let searchText = $('#inp-name').val()
  let trackedObject = $('#trackedObject').val()

  let search = {
    "type": "records",
    "search": searchText, //Search by text / API Name:
    "sobjectApi": trackedObject //Tracked Objects
  }
  localStorage.setItem('searchDrResults', null)
  let searchResults = await serviceSalesforce.getDataRecords(client, Handlebars, search)
  let myInterval = setInterval(() => {
    if (JSON.parse(localStorage.getItem('searchDrResults')) == null) { } else {
      searchResults = JSON.parse(localStorage.getItem('searchDrResults'))
      renderlook(searchResults)
      clearInterval(myInterval)
    }
  }, 700);


  // client.invoke('destroy')
}
window.checkAll = function checkAll(source) {
  let checkboxes = document.querySelectorAll('input[type="checkbox"]')
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i] != source) checkboxes[i].checked = source.checked
  }
}
window.addCustom = async function addCustom() {
  $('#mod-inner #loader').addClass('loader')
  $('#mod-inner #loader-pane').addClass('loader-pane')

  const obj = {
    proposedDataRecords: [],
    proposedCustomizations: [],
    existingDataRecords: [],
    existingCustomizations: [],
    currentStatus: '',
    approvalStatus:''
  }
  const getTicketObj  = await JSON.parse(localStorage.getItem(`ticketObj`))
  let ticketNumber = getTicketObj.ticketNumber

 
  let data = JSON.parse(localStorage.getItem(`ticketData-${ticketNumber}`)).data

  obj.proposedDataRecords = data.proposedDataRecords
  obj.proposedCustomizations = data.proposedCustomizations === null ? [] : data.proposedCustomizations.split('\n')
  obj.existingCustomizations = data.existingCustomizations
  obj.currentStatus = data.completionStatus
  obj.approvalStatus = data.ApprovalStatus 

  data.existingDataRecords.forEach(e => {
    let cust = {
      "sobjectApiName": `${e.sobjectApiName}`,      
      "dataRecordName": `${e.dataRecordName}`,
      "dataRecordId": `${e.dataRecordId}`
    }
    obj.existingDataRecords.push(cust)
  });


  let inputs = $('.check')
  $('.check').each(i => {
    if (inputs[i].checked) {
      let custom = {
        "sobjectApiName": `${inputs[i].dataset.apiname}`,
        "dataRecordName": `${inputs[i].value}`,
        "dataRecordId": `${inputs[i].dataset.id}`
        
      }
      obj.existingDataRecords.push(custom)
    }
  })
 let postCustomization = await serviceSalesforce.postCustomization(client, Handlebars, obj, true, false)
  client.on('destroy', function () {
   client.invoke('destroy')
  })
}

// notificaciones
function notifications(type, message) {
  $.showNotification({
    body: message,
    duration: 3000,
    type: type,
    maxWidth: "300px",
    shadow: "0 2px 6px rgba(0,0,0,0.2)",
    zIndex: 100,
    margin: "1rem"
  })
}
function removeLoader() {
  if ($(`#loader`)) {
    $(`#loader`).removeClass('loader').trigger('enable')
    $('#loader-pane').removeClass('loader-pane')
  }
}
function renderlook(res) {
  let resultList = document.querySelector('.resultList')
  resultList.innerHTML = ''
  res.forEach(res => {
    //console.log(res)
    const tr = document.createElement('tr')
    tr.className = 'look-tr'
    tr.innerHTML = `<td headers="name" class="d-flex w-30">
                            <input type="checkbox" class="lookupSelectedCusts my-auto check" name="lookupSelectedCusts" value="${res.dataRecordName}" data-id="${res.dataRecordId}" data-apiname="${res.sobjectApiName}">
                            <span class="my-auto os-12 w-100">${res.sobjectApiName}</span>                            
                        </td>
                        <td class="d-flex w-30">
                            <p class="os-12 w-100"><i>${res.dataRecordName}</i></p>
                        </td>
                        <td class="d-flex w-30">
                            <p class="os-12 w-100"><i>${res.dataRecordId}</i></p>
                        </td>`
    resultList.appendChild(tr)
  })
  removeLoader()
}