import { SkynetClient } from 'skynet-js'
import MD5 from 'crypto-js/md5'

import type { File as Metadata } from '@oceanprotocol/lib/dist/node/ddo/interfaces/File'

export const skynetUpload = async (json: object[]): Promise<Metadata> => {
    return new Promise( async (resolve, reject) => {
        if (!json.length) {
            return reject(new Error('The stream does not have content for upload'))
        }

        console.log('Upload to Skynet ...')

        const encoding = 'UTF-8'
        const checksumType = 'MD5'
        const fileName = 'file.json'
        const contentType = 'application/json'
        const blobData = <BlobPart> JSON.stringify(json)
        const contentLength = <string> blobData.toString().length.toString()
        const checksum = <string> MD5(blobData).toString()
        const client = <SkynetClient> new SkynetClient('https://siasky.net')

        try {
            const blob = <Blob> new Blob([blobData], { type: contentType })
            const file = <File> new File([blob], fileName)
            const skylink = <string> await client.uploadFile(file)
            const url = <string> client.getSkylinkUrl(skylink)

            return resolve(<Metadata> {url, contentLength, contentType, encoding, checksum, checksumType })
        } catch (error) {
            return reject(new Error(`Skynet upload error: ${error}`))
        }
    })
}
