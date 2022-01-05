//IMPORTS
import { serviceNetsuite } from "./modules/serviceNetsuite.js"
import { serviceZendesk } from "./modules/serviceZendesk.js"
//VARIABLES
let client = ZAFClient.init()
let ticketId
let accountId = 'tstdrv1724328'
//CODIGO
impactAnalisis()
async function impactAnalisis() {
  $('#pills-tabContent #loader').addClass('loader')
  $('#pills-tabContent #loader-pane').addClass('loader-pane')
  ticketId = localStorage.getItem('crId')
  let accountId = await serviceZendesk.getNsClietId(client)
  let getImpactAnalisis = await serviceNetsuite.getImpactAnalisis(client, ticketId,accountId)
  let impact_analysis_data = getImpactAnalisis
  if (getImpactAnalisis.message === 'success') {
    impact_analysis_data = impact_analysis_data.data
    if (impact_analysis_data === null) {
      $('.impact-analisis').innerHtml =
        '<table class="aui" style="size:10px"><tbody><tr><td>No Impact Analysis data</td></tr></tbody></table>'
      removeLoader()
    } else {
      let safe_data = impact_analysis_data.safe
      let not_safe_data = impact_analysis_data.notSafe
      let not_active_data = impact_analysis_data.notActive

      let pillsSafe = document.querySelector('#pills-safe')
      let pillsNotsafe = document.querySelector('#pills-notsafe')
      let pillsInactive = document.querySelector('#pills-inactive')

      if (safe_data.length !== 0) {
        let dataSafe = document.querySelector('.data-safe')
        dataSafe.innerHTML = ''
        safe_data.forEach(element => {
          const tr = document.createElement('tr')
          tr.className = 'look-tr'
          tr.innerHTML = `  
                                  <td class=" item d-flex w-100 my-auto justify-content-center">
                                      <p class="os-12 my-auto">${element.name}</p>
                                  </td>                                  
                                  `
          dataSafe.appendChild(tr)
          let anchor = document.querySelectorAll('.item p a')
          anchor.forEach(e => {
            e.className = 'item-url'
            e.host = `${accountId}`
          })
        })
        
      } else {
        pillsSafe.innerHTML =
          '<p class="os-16 fw-bold mt-5">No information available to display</p>'
      }
      if (not_safe_data.length !== 0) {
        let dataNotsafe = document.querySelector('.data-notsafe')
        dataNotsafe.innerHTML = ''
        not_safe_data.forEach(element => {
          const tr = document.createElement('tr')
          tr.className = 'look-tr'
          tr.innerHTML = `  <td class=" item d-flex w-60">
                                        <p class="os-12 my-auto">${element.object}</p></td>
                                      <td class=" item d-flex w-40 my-auto">
                                          <p class="os-12 my-auto">${element.warning}</p>
                                      </td>
                                      <td class=" item d-flex w-40 my-auto">
                                          <p class="os-12 my-auto">${element.impactedlinks}</p>
                                      </td>
                                      `
          dataNotsafe.appendChild(tr)
          let anchor = document.querySelectorAll('.item p a')
          anchor.forEach(e => {
            e.className = 'item-url'
            e.host = `${accountId}`
          })
        })
      } else {
        pillsNotsafe.innerHTML =
          '<p class="os-16 fw-bold mt-5">No information available to display</p>'
      }
      if (not_active_data.length != 0) {
        let dataNotsafe = document.querySelector('.data-inactive')
        dataNotsafe.innerHTML = ''
        not_safe_data.forEach(element => {
          const tr = document.createElement('tr')
          tr.className = 'look-tr'
          tr.innerHTML = `  <td class=" item d-flex w-60">
                                        <p class="os-12 my-auto">${element.name}</p></td>
                                      <td class=" item d-flex w-40 my-auto">
                                          <p class="os-12 my-auto">${element.scriptid}</p>
                                      </td> `
          dataNotsafe.appendChild(tr)
          let anchor = document.querySelectorAll('.item p a')
          anchor.forEach(e => {
            e.className = 'item-url'
            e.host = `${accountId}`
          })
        })
      } else {
        pillsInactive.innerHTML =
          '<p class="os-16 fw-bold mt-5">No information available to display</p>'
      }
    }
    removeLoader()
  }
  if (getImpactAnalisis.statusText === 'error') {
    removeLoader()
  } 
}
function removeLoader() {
  if ($(`#loader`)) {
    $(`#pills-tabContent #loader`).removeClass('loader').trigger('enable')
    $('#pills-tabContent #loader-pane').removeClass('loader-pane')
  }
}

