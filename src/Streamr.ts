import StreamrClient from 'streamr-client'
import detectEthereumProvider from '@metamask/detect-provider'
import { STREAMR_SESSION_TOKEN } from './Config'

import type { AbstractProvider } from 'web3-core'

interface Auth {
    sessionToken?: string,
    provider?: object
}

interface Filter {
    last?: number,
    from?: { timestamp: number },
    to?: { timestamp: number }
}

interface Permission {
    id: number,
    user: string,
    operation: string
}

export const streamrCollect = async (streamId: string, filter: Filter): Promise<object[]> => {
    return new Promise( async (resolve, reject) => {
        console.log('Create stream snapshot ...')

        const provider = <AbstractProvider> await detectEthereumProvider()

        await provider.request!({ method: 'eth_requestAccounts' })

        let data = <object[]> []
        let sessionToken = <string> getSessionToken()

        const auth = <Auth> sessionToken ? { sessionToken } : { provider }

        const client = <StreamrClient> new StreamrClient({ auth, verifySignatures: 'never' })

        sessionToken = <string> await client.session.getSessionToken()

        setSessionToken(sessionToken)

        const stream = await client.getStream(streamId)

        if (!stream) {
            return reject(new Error('The stream you were looking for was not found.'))
        }

        if (! await hasSharePermission(stream)) {
            return reject(new Error('The stream does not have share permission.'))
        }

        const subscription = client.subscribe(
            { stream: streamId, resend: filter },
            (message: object) => data.push(message)
        )

        subscription.on('resent', () => client.disconnect())
        subscription.on('no_resend', () => client.disconnect())
        subscription.on('error', error => reject(error))

        client.on('disconnected', () => resolve(data))
        client.on('error', error => reject(error))
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
