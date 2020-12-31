
During the development the focus was on the implementation of a bridge between Streamr Network, Skynet and Ocean Protocol: 
1. Extracting static content from a Streamr stream
2. Uploading the stream snapshot to Skynet
3. Publishing the data set file on Ocean market

### Features
* Hand drafted, light weighted source code
* Full integration into Streamr look & feel
* Simple to use: Just install the Chrome Extension

### Limitations
* Available for streams with `stream_share` permission

### Todos
* Add sample file
* Time range (timestamp - timestamp) for stream snapshots
* Consideration of multiple partitions for streams
* Prefill form input fields with stream infos


### Fixes

#### Streamr
* `provider.getSigner().address.toLowerCase` -> `this.publisherId = this.auth.provider.selectedAddress`
