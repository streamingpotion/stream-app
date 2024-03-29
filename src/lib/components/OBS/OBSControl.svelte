<script lang="ts">
  import { onDestroy } from 'svelte';
  import { convertMsToTime } from '$lib/_includes/generalHelpers';
  import Block from '$lib/components/Grid/Block.svelte'
  import Play from '$lib/components/icons/Play.svelte';
  import Signal from '$lib/components/icons/Signal.svelte';
  import Stop from '$lib/components/icons/Stop.svelte';
  import Pause from '$lib/components/icons/Pause.svelte';
  import { obsSession, obsConnected } from "$lib/stores/obsSessionStore";
  import ConnectObs from '$lib/components/OBS/ConnectObs.svelte';

  let streaming:boolean = false;
  let recording:boolean = false;
  let recordingPaused:boolean = false;
  let stopping:boolean = false;
  let recordTime:number = 0;
  let streamingTime:number = 0;
  let controlPromise:any = Promise.resolve([]);
  
  // TODO: types?
  let recordInterval:any = null
  let streamInterval:any = null

  onDestroy(() => {
    $obsSession.obs.off('RecordStateChanged', () => {});
    $obsSession.obs.off('StreamStateChanged', () => {});
	});

  const loadStatus = async() => {
    const recordStatus = await $obsSession.obs.call('GetRecordStatus');
    const streamStatus = await $obsSession.obs.call('GetStreamStatus');

    recording = recordStatus.outputActive;
    recordingPaused = recordStatus.outputPaused;
    streaming = streamStatus.outputActive;
    recordTime = recordStatus.outputDuration;
    streamingTime = streamStatus.outputDuration;

    const startRecordTimer = () => {
      setTimeout(() => {
        recordTime += 1000 - (recordTime % 1000); 
      }, 1000 - (recordTime % 1000))

      recordInterval = setInterval(() => {
        recordTime += 1000;
      }, 1000);
    }

    const startStreamTimer = () => {
      setTimeout(() => {
        streamingTime += 1000 - (streamingTime % 1000); 
      }, 1000 - (streamingTime % 1000))

      streamInterval = setInterval(() => {
        streamingTime += 1000;
      }, 1000);
    }

    $obsSession.obs.on('RecordStateChanged', (e) => {
      switch(e.outputState) {
        case 'OBS_WEBSOCKET_OUTPUT_STARTED' :
          recording = true;
          startRecordTimer();
          break;
        case 'OBS_WEBSOCKET_OUTPUT_PAUSED' :
          recordingPaused = true;
          clearInterval(recordInterval)
          break;
        case 'OBS_WEBSOCKET_OUTPUT_RESUMED' :
          startRecordTimer();
          recordingPaused = false;
          break;
        case 'OBS_WEBSOCKET_OUTPUT_STOPPING' :
          stopping = true;
          break;
        case 'OBS_WEBSOCKET_OUTPUT_STOPPED' :
          recording = false;
          recordingPaused = false;
          stopping = false;
          clearInterval(recordInterval)
          recordInterval = null
          recordTime = 0;
          break;
        }
    });

    $obsSession.obs.on('StreamStateChanged', (e) => {
      streaming = e.outputActive
      if (e.outputActive) {
        startStreamTimer();
      }
      else {
        clearInterval(streamInterval)
        streamInterval = null
        streamingTime = 0;
      }
    });
  }

  const renderStatus = (node:HTMLDivElement) => {
    controlPromise = loadStatus();
  }

  const OBSStream = async() => {
    await $obsSession.obs.call('ToggleStream');
    streaming = !streaming;
  }

  const OBSRecord = async() => {
    await $obsSession.obs.call('ToggleRecord');
    recording = !recording;
  }

  const OBSRecordPause = async() => {
    await $obsSession.obs.call('ToggleRecordPause');
    recordingPaused = !recordingPaused;
  }

  $: convertedStreamingTime  = convertMsToTime(streamingTime);
  $: convertedRecordingTime  = convertMsToTime(recordTime);
</script>

<Block type="obs" sizeX={4} sizeY={2} on:dragtoggle on:deleteblock on:lockblock>
  <div class="obs-control">
    {#if $obsConnected}
      <div class="connect-wrapper" use:renderStatus> </div>
      {#await controlPromise}
        <!-- TODO: Style waiting -->
        <span>waiting</span>
      {:then} 
        <div class="wrapper">
          <div class="control">
            <div class="time">
              <span><Signal width="16px" height="16px"/></span>
              <span>LIVE: {convertedStreamingTime}</span>  
            </div>
            <div class="buttons">
              <button type="button" on:click={OBSStream}>
                <svelte:component width="20px" height="20px" this={streaming ? Stop : Play}/>
              </button>
            </div>
          </div>
          <div class="control">
            <div data-active={recording} data-paused={recordingPaused} class="time">
              <span class='circle'></span>
              <span>REC: {convertedRecordingTime}</span>  
            </div>
            <div class="buttons">
              <button type="button" on:click={OBSRecord}>
                <svelte:component width="20px" height="20px" this={recording ? Stop : Play}/>
              </button>
              {#if recording} 
                <button type="button" on:click={OBSRecordPause}>
                  <Pause width="20px" height="20px"/>
                </button>
              {/if}
            </div>
          </div>
        </div>
      {/await}

    {:else}
      <ConnectObs />
    {/if}
  </div>

</Block>

<style lang="scss">
  @import '../../../styles/vars.scss';
  .obs-control {
    background-color: $off-black;
    color: #fff;
    overflow: auto;
    padding: 8px 16px;
    min-height: 64px
  }

  .time {
    display: flex;
    gap: 4px;
    font-size: 14px;
    align-items: center;

    .circle {
      width: 12px;
      height: 12px;
      background-color: currentColor;
      border-radius: 100%;
    }

    &[data-active=true] {
      color: $pink;
    }

    &[data-paused=true] {
      color: yellow;
    }
  }

  .wrapper {
    display: flex;
    justify-content: space-between;
  }
  
  .control {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 4px;
  }
  
  .buttons {
    display: flex;
    gap: 4px;
  }

  button {
    flex: 1 0 auto;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    padding: 4px;
    cursor: pointer;
    transition: $transition;

    &:hover,
    &:focus {
      opacity: .5;
    }
  }
</style>