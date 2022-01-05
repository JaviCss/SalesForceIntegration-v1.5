export const serviceZendesk = {
    getCurrentUser,
    getTicketInfo,
    getManifestInfo,
    getAppId,
    getNsDomain,
}
//UTILIDADES
function getAppId(client) {
    return client.metadata().then(metadata => {
        return metadata.appId
    })
}
function getSettingsobj(client,params) {
  return client.request(params).then(function (data) {
        let approverGroups = data.settings.approveGroups
        let requestApproveGroups = data.settings.requestApproveGroups
        let approvalProcess = data.settings.approvalProcess
        return {
            approverGroups,
            requestApproveGroups,
            approvalProcess,
        }
    }, function (e) { return e })
}
async function getinstallationId(client) {
    let id = await getAppId(client)
    let settings2 = {
        url: '/api/v2/apps/installations.json?include=app',
        type: 'GET',
        dataType: 'json',
    }
    return client.request(settings2).then(function (data) {
        let installId
        data.installations.forEach(e => {
            if (e.app_id === id) {
                installId = e.id                 
            }
        })
        return installId
    }, function (e) { })
}
//METODOS
function getCurrentUser(client) {
    return client.get('currentUser').then(async function (data) {
        return data['currentUser']
    })
}
function getTicketInfo(client) {
    return client.get('ticket').then(async function (data) {
        return {
            ticketNumber: data.ticket.id.toString(),
            ticketSubject: data.ticket.subject,
            ticketDescription: data.ticket.description,
            ticketStatus: data.ticket.status,
        }
    })
}
async function getManifestInfo(client) {   
    let installationId = await getinstallationId(client)
    let settings = {
        url: `/api/v2/apps/installations/${installationId}`,
        type: 'PUT',
        dataType: 'json',
    }
    let obj = await getSettingsobj(client,settings)
    return obj    
}

function getNsDomain(client) {   
   return client.metadata().then(function(metadata) {
        return metadata.settings.domain
      
      });
    
}