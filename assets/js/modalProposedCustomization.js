//IMPORTS
//IMPORTS
import { serviceSalesforce } from "./modules/serviceSalesforce.js"
import { serviceZendesk } from "./modules/serviceZendesk.js"
//VARIABLES
var client = ZAFClient.init()
getSelects(client, Handlebars)
//SUBMIT
document.querySelector('#modal').addEventListener('submit', (e) => {
  event.preventDefault()
  submitData()
})

async function getSelects(client, Handlebars) {
  let types = await serviceSalesforce.getSfdcTypes(client, Handlebars)
  removeLoader()
}

async function submitData() {
  $(' #loader').addClass('loader')
  $(' #loader-pane').addClass('loader-pane')
  // //addCostumization propose sales force
  let customizationType = $('#inp-scriptid').val()
  console.log(customizationType)

  const obj = {
    proposedDataRecords: [],
    proposedCustomizations: [],
    existingDataRecords: [],
    existingCustomizations: [],
    currentStatus: '',
    approvalStatus: ''
  }
  const getTicketObj  = await JSON.parse(localStorage.getItem(`ticketObj`))
  let ticketNumber = getTicketObj.ticketNumber

  let data = JSON.parse(localStorage.getItem(`ticketData-${ticketNumber}`)).data
 
  obj.proposedDataRecords = data.proposedDataRecords
  obj.existingDataRecords = data.existingDataRecords
  obj.existingCustomizations = data.existingCustomizations
  obj.currentStatus = data.completionStatus
  obj.approvalStatus = data.ApprovalStatus
  /*************************************************/

  if (data.proposedCustomizations === null) {
    obj.proposedCustomizations.push(customizationType)
  } else {
    obj.proposedCustomizations = data.proposedCustomizations.split('\n')
    obj.proposedCustomizations.push(customizationType)
  }
  
  

  /*************************************************/

  let postCustomization = await serviceSalesforce.postCustomization(client, Handlebars, obj, true, false)
  client.on('destroy', function () {
    client.invoke('destroy')
  })
}
$('#customizationType').change(function () {
  var prefix = $(this).val()
  if (prefix != '99999') {
    document.getElementById('inp-scriptid').value = $(this).val() + '--'
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
