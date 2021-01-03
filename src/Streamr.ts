import StreamrClient from 'streamr-client'
import { getEndpointUrl } from 'streamr-client/src/utils'
import createMetaMaskProvider  from 'metamask-extension-provider'
import { STREAMR_SESSION_TOKEN } from './Config'

import type { AbstractProvider } from 'web3-core'

interface Auth {
    sessionToken?: string,
    provider?: object
}

interface Permission {
    id: number,
    user: string,
    operation: string
}

export const streamrCollect = async (streamId: string, count: number): Promise<object[]> => {
    return new Promise( async (resolve, reject) => {
        window['streamr2ocean'].status = 'Retrieve stream snapshot ...'

        const provider = <AbstractProvider> await createMetaMaskProvider()

        provider['autoRefreshOnNetworkChange'] = false

        await provider.request!({ method: 'eth_requestAccounts' })

        let sessionToken = <string> getSessionToken()

        const auth = <Auth> sessionToken ? { sessionToken } : { provider }

        const client = <StreamrClient> new StreamrClient({ auth, verifySignatures: 'never' })

        sessionToken = <string> await client.session.getSessionToken()

        setSessionToken(sessionToken)

        const stream = await client.getStream(streamId)

        if (!stream) {
            return reject(new Error('The stream was not found'))
        }

        if (! await hasSharePermission(stream)) {
            return reject(new Error('Share permission missing'))
        }

        const endpointUrl = getEndpointUrl(client.options.restUrl, 'streams', streamId, 'data', 'partitions', 0, 'last') + `?count=${count}`

        // No client.subscribe(), because Chrome Extensions can't handle WebSockets
        fetchStreamSnapshot(endpointUrl)
            .then(data => resolve(data))
            .catch(error => reject(error))
    })
}

const getSessionToken = (): string => {
    return <string> window.sessionStorage.getItem(STREAMR_SESSION_TOKEN)
}

const setSessionToken = (sessionToken: string): void => {
    window.sessionStorage.setItem(STREAMR_SESSION_TOKEN, sessionToken)
}

const hasSharePermission = async (stream): Promise<boolean> => {
    const permissions = <Permission[]> await stream.getMyPermissions()

    return !!permissions.filter(e => e.operation === 'stream_share').length
}

const fetchStreamSnapshot = async (url: string): Promise<object[]> => {
    return new Promise( async (resolve, reject) => {
        fetchRetry(url, 5)
            .then(json => resolve(json.map(item => item['content'])))
            .catch(error => reject(error))
    })
}

const fetchRetry = async (url: string, retries: number): Promise<object[]> => {
    return fetch(url).then(async response => {
        if (!response.ok || response.status !== 200) {
            throw new Error('The stream has no content')
        }

        const json = await response.json()

        if (json.length) {
            return json
        }

        if (retries > 0) {
            window['streamr2ocean'].status = 'API returned an empty stream snapshot, retry ...'

            return fetchRetry(url, retries - 1)
        }

        throw new Error('Still an empty stream snapshot, aborted')
    })
}
