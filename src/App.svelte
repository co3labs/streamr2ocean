<script>
    import { onMount } from 'svelte';
    import { oceanPublish } from './Ocean';
    import { skynetUpload } from './Skynet';
    import { streamrCollect } from './Streamr';

    const fire = async () => {
        if (!('ethereum' in window)) {
            return alert('You need an Ethereum Client for using this function')
        }

        streamrCollect('0x688759bcbb6adf32a07e91f6de84d181b252e655/just-a-test', { last: 5 })
            .then(streamrJson => skynetUpload(streamrJson))
            .then(fileMetadata => oceanPublish(fileMetadata))
            .then(ddo => console.log(ddo))
            .catch(error => console.error(error))
    }

    onMount(async () => {
        // streamrCollect('DQtgcUkCSRG4_AcQISerCQ', { last: 5 })
        streamrCollect('0x688759bcbb6adf32a07e91f6de84d181b252e655/just-a-test', { last: 5 })
        // await oceanPublish()
    })
</script>

<button type="button" on:click="{fire}">FIRE</button>
