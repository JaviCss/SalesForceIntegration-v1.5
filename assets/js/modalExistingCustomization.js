//IMPORTS
import { serviceSalesforce } from "./modules/serviceSalesforce.js"
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
  let types = await serviceSalesforce.getSfdcTypes(client, Handlebars)
  let lastModifiedBy = await serviceSalesforce.getLastModifiedBy(client, Handlebars)
  let getPackages = await serviceSalesforce.getPackages(client, Handlebars)
  removeLoader()
}
async function submitData() {
  $(' #loader').addClass('loader')
  $(' #loader-pane').addClass('loader-pane')
  // //addCostumization propose NS
  //let accountId = await serviceZendesk.getNsClietId(client)
  let searchText = $('#searchText').val()
  let customizationType = $('#customizationType').val()
  let lastModified = $('#lastModified').val()
  let packageSelected = $('#package').val()

  let search = {
    "searchTerm": searchText, //Search by text / API Name:
    "lastModifiedBy": lastModified, //Last Modified By:
    "packageSelected": packageSelected, // Package:
    "includePackage": customizationType //Customization Type:
  }
  localStorage.setItem('searchResults', null)
  let searchResults = await serviceSalesforce.getCustomizationSearchResults(client, Handlebars, search)
  let myInterval = setInterval(() => {
    if (JSON.parse(localStorage.getItem('searchResults')) == null) { } else {
      searchResults = JSON.parse(localStorage.getItem('searchResults'))
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
  obj.existingDataRecords = data.existingDataRecords
  obj.currentStatus = data.completionStatus
  obj.approvalStatus = data.ApprovalStatus 

  

  console.log(data.completionStatus)
  console.log(data.ApprovalStatus)
  
  data.existingCustomizations.forEach(e => {
    let cust = {
      "internalId": `${e.internalId}`,
      "name": `${e.name}`
    }
    obj.existingCustomizations.push(cust)

  });    

  let inputs = $('.check')
  $('.check').each(i => {
    if (inputs[i].checked) {
      let custom = {
        "internalId": `${inputs[i].dataset.id}`,
        "name": `${inputs[i].value}`
      }
      obj.existingCustomizations.push(custom)
    }
  })
  let postCustomization = await serviceSalesforce.postCustomization(client, Handlebars, obj, true, false)
 client.on('destroy', function () {
    client.invoke('destroy')
  })
}
$('#inp-type').change(function () {
  var prefix = $(this).val()
  if (prefix != '99999') {
    document.getElementById('inp-scriptid').value = $(this).val() + '_'
  } else {
    document.getElementById('inp-scriptid').value = ''
  }
})
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
    tr.innerHTML = `<td headers="name" class="d-flex w-60">
                            <input type="checkbox" class="lookupSelectedCusts my-auto check" name="lookupSelectedCusts" value="${res.name}" data-id="${res.internalId}">
                            <span class="my-auto os-12 w-100">${res.name}</span>                            
                        </td>
                        <td class="d-flex w-40">
                            <p class="os-12 w-100"><i>${res.internalId}</i></p>
                        </td>`
    resultList.appendChild(tr)
  })
  removeLoader()
}