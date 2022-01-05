//letIABLES 

export const serviceSalesforce = {
    setCredencials,
    checkT,
    getCustomization,
    getSfdcTypes,
    getLastModifiedBy,
    getPackages,
    getCustomizationSearchResults,
    postCustomization,
    deleteExistingCustomization,
    deleteProposedCustomization,
    getTrackedObject,
    getDataRecords,
    deleteExistingDataRecord,
    deleteProposedDataRecord,
    getName,
    getTicket,


    getModifyBy,
    getFilterData,
    getImpactAnalisis,
    setUpdateTicketStatus,
    setBundle,
    setCustomizations,
    addCustomSelecte,
    deleteBundle,
    deleteExistingCustomization,
    deletePorposedCustomization,

}


async function setCredencials(client) {
    let settings = {
        url: `/api/v2/organizations`,
        type: 'get',
        dataType: 'json',
    }
    let urlDomain = await client.request(settings).then(async function (data) {
        return data.organizations[0].url
    })
    let url = new URL(urlDomain)
    const p = {
        url: `https://server-sf.herokuapp.com/auth/user`,
        headers: {
            "consumeri": "{{setting.consumeri}}",
            "consumers": "{{setting.consumers}}",
            "domain": url.host
        },
        secure: true,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            "consumeri": "{{setting.consumeri}}",
            "consumers": "{{setting.consumers}}",
            "domain": url.host
        }),
    }
    return client.request(p).then(results => {

        let strWindowFeatures = "height=570,width=520,scrollbars=yes,status=yes";
        let URL = `https://server-sf.herokuapp.com/auth/salesforce?domain=${url.host}`
        let win = window.open(URL, "_blank", strWindowFeatures);
        console.log(results)
        return url.host
    })



}


async function checkT(client, Handlebars, callback) { //startAuth
    let settings = {
        url: `/api/v2/organizations`,
        type: 'get',
        dataType: 'json',
    }
    let urlDomain = await client.request(settings).then(function (data) {
        return data.organizations[0].url
    })
    let url = new URL(urlDomain)
    // client.invoke('notify', 'Authenticating...');
    let source = $("#start_auth-hdbs").html();
    let template = Handlebars.compile(source);
    let html = template({ domain: url.host });
    $("#content").html(html);
    $(window).on("message", async function (event) {
        let origin = event.origin || event.originalEvent.origin;
        if (origin !== "https://server-sf.herokuapp.com")
            return;
        let msg = event.data || event.originalEvent.data;
        if (msg.token == 'undefined') {
            console.log('token undefined')
            client.invoke('notify', 'You must login in Salesforce.');
            showStart();

        } else {
            console.log(msg.token)
            console.log(msg.instance_url)
            await callback(msg.token, msg.instance_url)
        }
    })
}
//UTILIDADES
function modalDestroy(client) {
    let topBarClientPromise = client
        .get('instances')
        .then(function (instancesData) {
            let instances = instancesData.instances
            for (let instanceGuid in instances) {
                if (instances[instanceGuid].location === 'modal') {
                    return client.instance(instanceGuid)
                }
            }
        })
    topBarClientPromise.then(function (topBarClient) {
        topBarClient.trigger('destroy')
    })
}
function reloadApp(client) {
    let topBarClientPromise = client
        .get('instances')
        .then(function (instancesData) {
            let instances = instancesData.instances
            for (let instanceGuid in instances) {
                if (instances[instanceGuid].location === 'ticket_sidebar') {
                    return client.instance(instanceGuid)
                }
            }
        })
    topBarClientPromise.then(function (topBarClient) {
        topBarClient.trigger('reloadApp')
    })
}
function getSettingsobj(client, params) {
    return client.request(params).then(function (data) {
        let approverGroups = data.settings.approveGroups
        let requestApproveGroups = data.settings.requestApproveGroups
        let approvalProcess = data.settings.approvalProcess
        let account = data.settings.domain
        return {
            account,
            approverGroups,
            requestApproveGroups,
            approvalProcess,
        }
    }, function (e) { return e })
}
function getAppId(client) {
    return client.metadata().then(metadata => {
        return metadata.appId
    })
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
async function getManifestInfo(client) {
    let installationId = await getinstallationId(client)
    let settings = {
        url: `/api/v2/apps/installations/${installationId}`,
        type: 'PUT',
        dataType: 'json',
    }
    let obj = await getSettingsobj(client, settings)
    return obj
}
function setPathEncoded(baseObject) {
    let result = ''
    Object.entries(baseObject).forEach(([item, prop]) => {
        if (prop && prop.trim() !== '')
            result += `${result.length > 0 ? '&' : ''}${item}=${encodeURIComponent(prop.trim())}`
    })
    return result
}
function setPath(baseObject) {
    let result = ''
    Object.entries(baseObject).forEach(([item, prop]) => {
        if (prop && prop.trim() !== '')
            result += `${result.length > 0 ? '&' : ''}${item}=${prop.trim()}`
    })
    return result
}
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
function getCurrentUser(client) {
    return client.get('currentUser').then(async function (data) {
        return data['currentUser']
    })
}
function getTicket(client) {
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
function obtData() {
    let value = document.getElementById('inp-name').value
    let modifiedby = document.getElementById('inp-modif').value
    let scriptid = document.getElementById('inp-scriptid').value
    let type = document.getElementById('inp-type').value
    let bundleid = document.getElementById('inp-bundleid').value
    let from = document.getElementById('inp-date-from').value
    let to = document.getElementById('inp-date-to').value
    from = formatDate(from)
    let r = {
        value: value,
        modifiedby: modifiedby,
        scriptId: scriptid,
        type: type,
        bundleId: bundleid,
        from: from,
        to: to,
    }
    return r
}
function formatDate(date1) {
    let fechaFrom = ''
    if (date1 === '') {
    } else {
        let cdate = new Date(date1)
        let options = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        }
        date = cdate.toLocaleDateString('es-ar', options)
        date1 = date.split('/')
        //estrae el año
        let month = date1[1]
        let day = date1[0] + 1
        let year = Array.from(date1[2])
        year.splice(0, 2)
        fechaFrom = `${month}/${day}/ ${year[0]}${year[1]}`
    }
    return fechaFrom
}
function getFormData() {
    let scriptid = document.getElementById('inp-scriptid').value
    return scriptid
}
//METODOS
//GET INFO
async function getCustomization(client, Handlebars) {
    
    const getTicketObj = await getTicket(client)
    let ticketNumber = getTicketObj.ticketNumber

    localStorage.setItem(`ticketData-${ticketNumber}`, null)
    let packageName = 'FLODocs'
    const callback = (access, instance_url) => {
        let options = {
            url: `${instance_url}/services/apexrest/${packageName}/changeRequest/${ticketNumber}`,
            type: 'GET',
            headers: { "Authorization": `Bearer ${access}` },
            contentType: 'application/json',
        }
        return client.request(options).then(results => {
            localStorage.setItem(`ticketData-${ticketNumber}`, JSON.stringify(results))
            const elementos2 = document.querySelectorAll('#infoNs')
            const elementos = document.querySelectorAll('.statusbar')
            if (results.status === 'success') { }
            if (results.status === 'failed') { notifications('primary', results.message) }
            if (!results.inactive) {
                for (let i = 0; i < elementos.length; i++) {
                    elementos[i].classList.remove('hid')
                    elementos[i].classList.add('vis')
                }
                for (let i = 0; i < elementos2.length; i++) {
                    elementos2[i].classList.remove('hid')
                    elementos2[i].classList.add('vis')
                }

            } else {
                for (let i = 0; i < elementos.length; i++) {
                    elementos[i].classList.add('hid')
                    elementos[i].classList.remove('vis')
                }
            }
            if (results.status === 'failed') {
                notifications('primary', results.message)
            }
        }).catch(e => {
            console.log(e)
            if (e.responseJSON[0].errorCode === 'INVALID_SESSION_ID' ){
                console.log(object)
                
            }
            const elementos = document.querySelectorAll('#infoNs')
            for (let i = 0; i < elementos.length; i++) {
                elementos[i].classList.remove('vis')
                elementos[i].classList.add('hid')
            }
            // removeLoader()
        })
    }
    await checkT(client, Handlebars, callback)
}
//EXISTING CUSTOMIZATIONS -- PROPOSED CUSTOMIZATIONS
async function getSfdcTypes(client, Handlebars) {
    let account = await getManifestInfo(client)
    account = account.account
    let query = 'Select Id, FLODOCS__Salesforce_Type__c From FLODOCS__FLO_Scanner_Log__c order by FLODOCS__Salesforce_Type__c ASC'
    let callback = (access, instance_url) => {
        let options = {
            url: `${instance_url}/services/data/v47.0/query/?q=${query}`,
            type: 'GET',
            headers: { "Authorization": `Bearer ${access}` },
            contentType: 'application/json',
        }
        return client.request(options).then(async results => {
            let opt = `<option value="" selected>-Select Customization Type-</option>`
            results.records.forEach(record => {
                opt += `<option value="${record.FLODocs__Salesforce_Type__c}">${record.FLODocs__Salesforce_Type__c}</option>`
            });
            $('#customizationType').html(opt)
        }).catch(e => {
            console.log(e)      // removeLoader()
        })
    }
    await checkT(client, Handlebars, callback)
}
async function getLastModifiedBy(client, Handlebars) {
    let account = await getManifestInfo(client)
    account = account.account
    let query = 'select FLODocs__Customization_Last_Modified_By__c id,FLODocs__Customization_Last_Modified_By__r.Name name FROM FLODocs__FLO_Customization__c  group by FLODocs__Customization_Last_Modified_By__c,FLODocs__Customization_Last_Modified_By__r.Name'
    let callback = (access, instance_url) => {
        let options = {
            url: `${instance_url}/services/data/v47.0/query/?q=${query}`,
            type: 'GET',
            headers: { "Authorization": `Bearer ${access}` },
            contentType: 'application/json',
        }
        return client.request(options).then(async results => {
            let opt = `<option value="" selected>-Select Modified By-</option>`
            results.records.forEach(record => {
                opt += `<option value="${record.name}">${record.name}</option>`
            });
            $('#lastModified').html(opt)
        }).catch(e => {
            console.log(e)      // removeLoader()
        })
    }
    await checkT(client, Handlebars, callback)
}
async function getPackages(client, Handlebars) {
    let account = await getManifestInfo(client)
    account = account.account
    let query = 'select flodocs__Namespace_Prefix__c package FROM FLODocs__FLO_Customization__c  group by flodocs__Namespace_Prefix__c'
    let callback = (access, instance_url) => {
        let options = {
            url: `${instance_url}/services/data/v47.0/query/?q=${query}`,
            type: 'GET',
            headers: { "Authorization": `Bearer ${access}` },
            contentType: 'application/json',
        }
        return client.request(options).then(async results => {
            let opt = `<option value="" selected>-Select Package-</option>`
            results.records.forEach(record => {
                opt += `<option value="${record.package}">${record.package}</option>`
            });
            $('#package').html(opt)
        }).catch(e => {
            console.log(e)      // removeLoader()
        })
    }
    await checkT(client, Handlebars, callback)
}
async function getCustomizationSearchResults(client, Handlebars, search) {
    let callback = (access, instance_url) => {
        let options = {
            url: `${instance_url}/services/apexrest/FLODocs/customizationSearch/`,
            type: 'PUT',
            headers: { "Authorization": `Bearer ${access}` },
            contentType: 'application/json',
            data: JSON.stringify({
                "searchTerm": search.searchTerm, //Search by text / API Name:
                "lastModifiedBy": search.lastModifiedBy, //Last Modified By:
                "packageSelected": search.packageSelected, // Package:
                "includePackage": search.includePackage //Customization Type:
            }),
        }
        return client.request(options).then(async results => {
            await localStorage.setItem('searchResults', JSON.stringify(results))
            return results
        }).catch(e => {
            console.log(e)      // removeLoader()
        })
    }
    await checkT(client, Handlebars, callback)
}

//DELETE CUSTOMIZATIONS
async function deleteExistingCustomization(client, Handlebars, existingId, existingName) {
    console.log('deleteExistingCustomization')
    const getTicketObj = await getTicket(client)
    let ticketNumber = getTicketObj.ticketNumber
    const obj = {
        proposedDataRecords: [],
        proposedCustomizations: [],
        existingDataRecords: [],
        existingCustomizations: [],
        currentStatus: '',
        approvalStatus: ''
    }
    
    let data = JSON.parse(localStorage.getItem(`ticketData-${ticketNumber}`)).data
    obj.proposedDataRecords = data.proposedDataRecords
    obj.proposedCustomizations = data.proposedCustomizations === null ? [] : data.proposedCustomizations.split('\n')
    obj.existingDataRecords = data.existingDataRecords
    obj.currentStatus = data.completionStatus
    obj.approvalStatus = data.ApprovalStatus

    data.existingCustomizations.forEach(item => {
        if (item.internalId === existingId && item.name === existingName) {
            // console.log('ITEM A QUITAR', item)
        } else {

            let cust = {
                "internalId": `${item.internalId}`,
                "name": `${item.name}`
            }
            obj.existingCustomizations.push(cust)
        }
    })
    await postCustomization(client, Handlebars, obj, false, true)

    reloadApp(client)

}
async function deleteProposedCustomization(client, Handlebars, itemDelete) {
    const getTicketObj = await getTicket(client)
    let ticketNumber = getTicketObj.ticketNumber
    console.log('deleteProposedCustomization')
    const obj = {
        proposedDataRecords: [],
        proposedCustomizations: [],
        existingDataRecords: [],
        existingCustomizations: [],
        currentStatus: '',
        approvalStatus: ''
    }
    let data = JSON.parse(localStorage.getItem(`ticketData-${ticketNumber}`)).data
    obj.proposedDataRecords = data.proposedDataRecords
    obj.proposedCustomizations = data.proposedCustomizations === null ? [] : data.proposedCustomizations.split('\n')
    obj.existingDataRecords = data.existingDataRecords
    obj.existingCustomizations = data.existingCustomizations
    obj.currentStatus = data.completionStatus
    obj.approvalStatus = data.ApprovalStatus



    let newProposedCustomizations = []
    obj.proposedCustomizations.forEach(item => {
        if (item === itemDelete) {
            // console.log('ITEM A QUITAR', item)
        } else {
            newProposedCustomizations.push(item)
        }
    })
    obj.proposedCustomizations = newProposedCustomizations
    await postCustomization(client, Handlebars, obj, false, true)
}
//DELETE DATA RECORDS
async function deleteExistingDataRecord(client, Handlebars, dataRecordName, sobjectApiName, dataRecordId) {
    const getTicketObj = await getTicket(client)
    let ticketNumber = getTicketObj.ticketNumber
    console.log('deleteExistingDataRecord')
    const obj = {
        proposedDataRecords: [],
        proposedCustomizations: [],
        existingDataRecords: [],
        existingCustomizations: [],
        currentStatus: '',
        approvalStatus: ''
    }
    let data = JSON.parse(localStorage.getItem(`ticketData-${ticketNumber}`)).data
    obj.proposedDataRecords = data.proposedDataRecords
    obj.proposedCustomizations = data.proposedCustomizations === null ? [] : data.proposedCustomizations.split('\n')
    obj.existingCustomizations = data.existingCustomizations
    obj.currentStatus = data.completionStatus
    obj.approvalStatus = data.ApprovalStatus

    data.existingDataRecords.forEach(item => {
        if (item.sobjectApiName === sobjectApiName && item.dataRecordName === dataRecordName && item.dataRecordId === dataRecordId) {
            // console.log('ITEM A QUITAR', item)
        } else {
            let cust = {
                "sobjectApiName": `${item.sobjectApiName}`,
                "dataRecordName": `${item.dataRecordName}`,
                "dataRecordId": `${item.dataRecordId}`
            }
            obj.existingCustomizations.push(cust)
        }
    })
    await postCustomization(client, Handlebars, obj, false, true)

}
async function deleteProposedDataRecord(client, Handlebars, sobjectApiName, dataRecordName) {
    const getTicketObj = await getTicket(client)
    let ticketNumber = getTicketObj.ticketNumber
    console.log('deleteProposedDataRecord')
    const obj = {
        proposedDataRecords: [],
        proposedCustomizations: [],
        existingDataRecords: [],
        existingCustomizations: [],
        currentStatus: '',
        approvalStatus: ''
    }
    let data = JSON.parse(localStorage.getItem(`ticketData-${ticketNumber}`)).data
    obj.proposedCustomizations = data.proposedCustomizations === null ? [] : data.proposedCustomizations.split('\n')
    obj.existingDataRecords = data.existingDataRecords
    obj.existingCustomizations = data.existingCustomizations
    obj.currentStatus = data.completionStatus
    obj.approvalStatus = data.ApprovalStatus

    data.proposedDataRecords.forEach(item => {
        if (item.sobjectApiName === sobjectApiName && item.dataRecordName === dataRecordName) {
            // console.log('ITEM A QUITAR', item)
        } else {
            let cust = {
                "sobjectApiName": `${item.sobjectApiName}`,
                "dataRecordName": `${item.dataRecordName}`
            }
            obj.proposedDataRecords.push(cust)
        }
    })
    await postCustomization(client, Handlebars, obj, false, true)
}

//EXISTING DATA RECORDS -- PROPOSED DATA RECORDS
async function getDataRecords(client, Handlebars, search) {
    let callback = (access, instance_url) => {
        let options = {
            url: `${instance_url}/services/apexrest/FLODocs/dataRecordSearch/?type=records&search=${search.search}&sobjectApi=${search.sobjectApi}`,
            type: 'GET',
            headers: { "Authorization": `Bearer ${access}` },
            contentType: 'application/json',
        }
        return client.request(options).then(async results => {
            await localStorage.setItem('searchDrResults', JSON.stringify(results))
            return results
        }).catch(e => {
            console.log(e)      // removeLoader()
        })
    }
    await checkT(client, Handlebars, callback)
}

async function getTrackedObject(client, Handlebars) {
    let callback = (access, instance_url) => {
        let options = {
            url: `${instance_url}/services/apexrest/FLODocs/dataRecordSearch/?type=objects`,
            type: 'GET',
            headers: { "Authorization": `Bearer ${access}` },
            contentType: 'application/json',
        }
        return client.request(options).then(async results => {
            let opt = `<option value="" selected>-Select Tracked Object-</option>`
            results.forEach(record => {
                opt += `<option value="${record.sobjectApiName}">${record.sobjectApiName}</option>`
            });
            $('#trackedObject').html(opt)
        }).catch(e => {
            console.log(e)      // removeLoader()
        })
    }
    await checkT(client, Handlebars, callback)
}
async function postCustomization(client, Handlebars, obj, modal, reload) {
    //LOGS
    console.log(JSON.stringify(obj.proposedDataRecords))
    console.log(obj.proposedCustomizations)
    console.log(JSON.stringify(obj.existingDataRecords))
    console.log(obj.existingCustomizations)
    console.log(obj.currentStatus)
    console.log(obj.approvalStatus)
    /////////////////////////////////////////////////////////////////////////////////////////
    

    const getTicketObj  = await JSON.parse(localStorage.getItem(`ticketObj`))
  
  //await getTicket(client)
    let ticketSubject = getTicketObj.ticketSubject
    let ticketDescription = getTicketObj.ticketDescription
    //let ticketStatus = getTicketObj.ticketStatus
    let urlticket = getTicketObj.urlticket
    let ticketNumber = getTicketObj.ticketNumber
    let packageName = 'FLODocs'
    const callback = (access, instance_url) => {
        let options = {
            url: `${instance_url}/services/apexrest/${packageName}/changeRequest/${ticketNumber}`,
            type: 'POST',
            headers: { "Authorization": `Bearer ${access}` },
            contentType: 'application/json',
            data: JSON.stringify({
                "ticketId": ticketNumber,
                "ticketName": ticketSubject,
                "ticketDescription": ticketDescription,
                "currentStatus": obj.currentStatus,//"In Progress",
                "approvalStatus": obj.approvalStatus,// "Pending Approval",
                "sourceType": "Zendesk",
                "externalLink": urlticket,
                "proposedDataRecords": obj.proposedDataRecords,
                "proposedCustomizations": obj.proposedCustomizations,
                "existingDataRecords": obj.existingDataRecords,
                "existingCustomizations": obj.existingCustomizations
            }),
        }
        return client.request(options).then(async results => {
            console.log(JSON.stringify(results))
            if (results.data === null) {
                if (modal === true) { modalDestroy(client) }
                if (reload === true) { console.log(reload) }
            }
           
        }).catch(e => {
            console.log(e)
            // removeLoader()
        })
    }
    let check = await checkT(client, Handlebars, callback)
}
async function getName(client, Handlebars) {
    let query = 'Select Id, name from organization'
    let callback = (access, instance_url) => {
        let options = {
            url: `${instance_url}/services/data/v47.0/query/?q=${query}`,
            type: 'GET',
            headers: { "Authorization": `Bearer ${access}` },
            contentType: 'application/json',
        }
        return client.request(options).then(async results => {
            results.records.forEach(e => {
                $('#synchronized').text(e.Name)

            })
        }).catch(e => {
            console.log(e)      // removeLoader()
        })
    }
    await checkT(client, Handlebars, callback)
}
async function setUpdateTicketStatus(client, currentStatus, approvalStatus) {
    const obj = {
        proposedDataRecords: [],
        proposedCustomizations: [],
        existingDataRecords: [],
        existingCustomizations: [],
        currentStatus: currentStatus,
        approvalStatus: approvalStatus
    }

    obj.proposedDataRecords = data.proposedDataRecords
    obj.proposedCustomizations = data.proposedCustomizations === null ? [] : data.proposedCustomizations
    obj.existingDataRecords = data.existingDataRecords
    obj.currentStatus = data.completionStatus
    obj.approvalStatus = data.ApprovalStatus

    //postCustomization(client, Handlebars, obj, false, true)
}



async function getModifyBy(client, accountId) {
    const scriptDeploy = 'flo_customization_api'
    const action = 'allEmployees'
    const selectOptions = { value: 'customer' }
    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPath(selectOptions)}`

    const head = await getSigned(client, accountId, scriptDeploy, action, selectOptions)


    let urln = domainBase + pathEncoded
    let options = {
        url: urln,
        type: 'GET',
        headers: head,
        secure: true,
        cors: false,
        contentType: 'application/json',
    }

    return client.request(options).then(results => {
        return results
    })

}
async function getFilterData(client, accountId) {
    const scriptDeploy = 'flo_customization_api'
    const action = 'search'
    const filter = obtData()
    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPath(filter)}`

    const head = await getSigned(client, accountId, scriptDeploy, action, filter)


    let urln = domainBase + pathEncoded
    let options = {
        url: urln,
        type: 'GET',
        headers: head,
        secure: true,
        cors: false,
        contentType: 'application/json',
    }

    return client.request(options).then(results => {
        let objectResp = JSON.parse(results)
        objectResp = objectResp.results
        return objectResp
    })
}
//TICKET STATUS

//BUNDLE
async function setBundle(client, bundleID, accountId) {
    let bundlesList = []
    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    const getTicketObj = await getTicket(client)
    let ticketNumber = getTicketObj.ticketNumber
    const scriptDeploy = 'flo_cr_api'
    const action = 'addBundleId'
    const values = {
        bundleId: bundleID,
        ticketID: ticketNumber,
    }


    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPath(values)}`

    const head = await getSigned(client, accountId, scriptDeploy, action, values)


    let urln = domainBase + pathEncoded
    let options = {
        url: urln,
        type: 'GET',
        headers: head,
        secure: true,
        cors: false,
        contentType: 'application/json',
    }
    $('#errorBundle')[0].innerHTML = ''
    return client.request(options).then(results => {
        if (results.status === 'failed') {
            notifications('primary', results.message)
        }
        if (results.status === 'success') {
            removeLoader()
            return bundlesList = results.affectedBundleID === '' ? [] : results.affectedBundleID.split(',')
        }
    })
}
async function deleteBundle(client, bundleID, accountId) {
    let bundlesList = []
    const getTicketObj = await getTicket(client)
    let ticketNumber = getTicketObj.ticketNumber
    const scriptDeploy = 'flo_cr_api'
    const action = 'removeBundleId'
    const values = {
        ticketID: ticketNumber,
        bundleId: bundleID,
    }
    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPath(values)}`
    const head = await getSigned(client, accountId, scriptDeploy, action, values)
    let urln = domainBase + pathEncoded
    let options = {
        url: urln,
        type: 'GET',
        headers: head,
        secure: true,
        cors: false,
        contentType: 'application/json',
    }
    $('#errorBundle')[0].innerHTML = ''
    return client.request(options).then(results => {
        if (results.status === 'failed') {
            notifications('primary', results.message)
        }
        if (results.status === 'success') {
            return bundlesList = results.affectedBundleID
        }
    })
}
//EXISTING CUSTOMIZATION
async function addCustomSelecte(client, existingId, ticketID, accountId) {
    const scriptDeploy = 'flo_cr_api'
    const action = 'addCustomizations'
    const selectedCustom = {
        existing: existingId,
        ticketID: ticketID,
    }
    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPath(selectedCustom)}`

    const head = await getSigned(client, accountId, scriptDeploy, action, selectedCustom)


    let urln = domainBase + pathEncoded
    let options = {
        url: urln,
        type: 'GET',
        headers: head,
        secure: true,
        cors: false,
        contentType: 'application/json',
    }
    return client.request(options).then(results => {

        if (results.status === 'failed') {
            notifications('primary', results.message)
            console.log(results.message)
        }
        if (results.status === 'success') {
            return results
        }

    })
}

//PROPOSED
async function setCustomizations(client) {
    const getTicketObj = await getTicket(client)
    let ticketID = getTicketObj.ticketNumber
    let account = await getManifestInfo(client).account
    const res = getFormData()
    const createdProposed = {
        proposed: res,
        ticketID: ticketID,
    }




}
async function deletePorposedCustomization(client, proposedName, ticketNumber, accountId) {

    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    const scriptDeploy = 'flo_cr_api'
    const action = 'removeCustomization'
    const params = {
        ticketID: ticketNumber,
        isExisting: '',
        existing: proposedName,
    }



    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPath(params)}`

    const head = await getSigned(client, accountId, scriptDeploy, action, params)


    let urln = domainBase + pathEncoded
    let options = {
        url: urln,
        type: 'GET',
        headers: head,
        secure: true,
        cors: false,
        contentType: 'application/json',
    }



    return client.request(options).then(results => {
        return results
    })
}
//IM´PACT ANALISIS
async function getImpactAnalisis(client, ticketId, accountId) {
    let domainBase = `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`
    const scriptDeploy = 'flo_impact_analysis_restlet'
    let oauth_nonce, oauth_signature, oauth_timestamp, realm;
    let path = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&crId=${ticketId}`
    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&crId=${ticketId}`
    accountId = accountId.toUpperCase()
    const p = {
        url: `https://strongpointsigned.herokuapp.com/sign.js`,
        headers: {
            "consumeri": "{{setting.consumeri}}",
            "consumers": "{{setting.consumers}}",
            "tokeni": "{{setting.tokeni}}",
            "tokens": "{{setting.tokens}}",
        },
        secure: true,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            "domainBase": `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`,
            "account_id": `${accountId}`,
            "path": path,
            "pathEncoded": pathEncoded
        }),
    }
    return client.request(p).then(results => {
        let authHeader = results.headers.Authorization.split(',')
        authHeader.forEach((item, i) => {
            if (i == 1) {
                let prop = item.split('=')
                oauth_nonce = prop[1]
            }
            if (i == 2) {
                let prop = item.split('=')
                oauth_signature = prop[1]
            }

            if (i == 4) {
                let prop = item.split('=')
                oauth_timestamp = prop[1]
            }

            if (i == 7) {
                let prop = item.split('=')
                realm = prop[1]
            }
        })

        let head = { Authorization: `OAuth oauth_consumer_key="{{setting.consumeri}}", oauth_nonce=${oauth_nonce}, oauth_signature=${oauth_signature}, oauth_signature_method="HMAC-SHA256", oauth_timestamp=${oauth_timestamp}, oauth_token="{{setting.tokeni}}", oauth_version="1.0",realm=${realm}` }

        let urln = domainBase + pathEncoded
        let options = {
            url: urln,
            type: 'GET',
            headers: head,
            secure: true,
            cors: false,
            contentType: 'application/json',
        }

        return client.request(options).then(results => {
            let result = JSON.parse(results)
            return result
        }).catch(e => { return e })
    })
}
function getSigned(client, accountId, scriptDeploy, action, formValues) {
    accountId = accountId.toUpperCase()
    //letIABLES
    let oauth_nonce, oauth_signature, oauth_timestamp, realm;
    let path = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPath(formValues)}`
    let pathEncoded = `/app/site/hosting/restlet.nl?script=customscript_${scriptDeploy}&deploy=customdeploy_${scriptDeploy}&action=${action}&${setPathEncoded(formValues)}`

    const p = {
        url: `https://strongpointsigned.herokuapp.com/sign.js`,
        headers: {
            "consumeri": "{{setting.consumeri}}",
            "consumers": "{{setting.consumers}}",
            "tokeni": "{{setting.tokeni}}",
            "tokens": "{{setting.tokens}}",
        },
        secure: true,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            "domainBase": `https://${accountId.toLowerCase()}.restlets.api.netsuite.com`,
            "account_id": `${accountId}`,
            "path": path,
            "pathEncoded": pathEncoded
        }),
    }
    return client.request(p).then(results => {
        let authHeader = results.headers.Authorization.split(',')
        authHeader.forEach((item, i) => {
            if (i == 1) {
                let prop = item.split('=')
                oauth_nonce = prop[1]
            }
            if (i == 2) {
                let prop = item.split('=')
                oauth_signature = prop[1]
            }

            if (i == 4) {
                let prop = item.split('=')
                oauth_timestamp = prop[1]
            }

            if (i == 7) {
                let prop = item.split('=')
                realm = prop[1]
            }
        })

        let head = { Authorization: `OAuth oauth_consumer_key="{{setting.consumeri}}", oauth_nonce=${oauth_nonce}, oauth_signature=${oauth_signature}, oauth_signature_method="HMAC-SHA256", oauth_timestamp=${oauth_timestamp}, oauth_token="{{setting.tokeni}}", oauth_version="1.0",realm=${realm}` }
        return head
    })

}
