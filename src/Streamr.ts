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
    from?: { timestamp: number }
    to?: { timestamp: number }
}

export const streamrCollect = async (streamId: string, filter: Filter): Promise<object[]> => {
    return new Promise( async (resolve, reject) => {
        console.log('Collect data from Streamr ...')

        const provider = <AbstractProvider> await detectEthereumProvider()

        await provider.request!({ method: 'eth_requestAccounts' })

        let data = <object[]> []
        let sessionToken = <string> getSessionToken()

        const auth = <Auth> sessionToken ? { sessionToken } : { provider }

        const client = <StreamrClient> new StreamrClient({ auth, verifySignatures: 'never' })

        const stream = await client.getStream(streamId)

        if (!stream) {
            return reject(new Error('Requested Stream not found.'))
        }

        // const permissions = await stream.hasPermission('stream_get', '0x688759bcbb6adf32a07e91f6de84d181b252e655')

        // return console.log(permissions)

        sessionToken = <string> await client.session.getSessionToken()

        setSessionToken(sessionToken)

        const subscription = client.subscribe(
            { stream: streamId, resend: filter },
            (message: object) => data.push(message)
        )

        subscription.on('resent', () => client.disconnect())

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
