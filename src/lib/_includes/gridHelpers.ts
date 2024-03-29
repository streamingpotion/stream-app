import { supabase } from "$lib/_includes/supabaseClient";
import Clock from "$lib/components/BrowserSource/Clock.svelte";
import DiscordUserInfo from '$lib/components/Discord/DiscordUserInfo.svelte';
import ObsControl from '$lib/components/OBS/OBSControl.svelte';
import ObsInput from "$lib/components/OBS/OBSInput.svelte";
import ObsScene from '$lib/components/OBS/OBSScene.svelte';
import TwitchChannelInfo from "$lib/components/Twitch/TwitchChannelInfo.svelte";
import TwitterGetTweets from "$lib/components/Twitter/TwitterGetTweets.svelte";
import type { SaveState, Block } from '$lib/types/general';

export const blockCodes:Block = {
  'CLCK': {
    name: 'Clock',
    block: Clock,
    sizeX: 4,
    sizeY: 2
  },
  'DISC-USER': {
    name: 'Discord User',
    block: DiscordUserInfo,
    sizeX: 4,
    sizeY: 2
  },
  'OBS-CTRL': {
    name: 'OBS: Stream / Record',
    block: ObsControl,
    sizeX: 4,
    sizeY: 2
  },
  'OBS-INPT' : {
    name: 'OBS: Input Control',
    block: ObsInput,
    sizeX: 4,
    sizeY: 4
  },
  'OBS-SCNE' : {
    name: 'OBS: Scenes Control',
    block: ObsScene,
    sizeX: 4,
    sizeY: 4
  },
  'TWCH-CHNL' : {
    name: 'Twitch: Channel Info',
    block: TwitchChannelInfo,
    sizeX: 4,
    sizeY: 4
  },
  'TWTR-GET' : {
    name: 'Twitter: Get Tweets',
    block: TwitterGetTweets,
    sizeX: 4,
    sizeY: 4
  },
};

export const checkExistingRow = async() => {
  let saveState:SaveState = {}

  try {
    const user = supabase.auth.user();
    let { data, error, status } = await supabase
      .from('grid')
      .select('*')
      .eq('id', user?.id)
      .single();

    if (error && status !== 406) { throw error; }

    if (data) {
      const {id: _i, updated_at: _u, ...filterSave} = data;

      saveState = Object.keys(filterSave)
      .filter((k) => filterSave[k] != null)
      .reduce((a, k) => ({ ...a, [k]: filterSave[k] }), {});
    }

    // If there's no row, create a row.
    if (status === 406) {
      const { error } = await supabase
      .from('grid')
      .insert({ id: user?.id }, { returning: "minimal" });
      if (error) { throw error; }
    }
  } catch (error) {
    console.error(error);
  }

  return saveState;
}

export const updateSaveState = async(saveState:SaveState) => {
  try {
    const user = supabase.auth.user();
    const updates = {
      id: user?.id,
      updated_at: new Date(),
      ...saveState
    };

    let { error } = await supabase.from("grid").upsert(updates, {
      returning: "minimal", // Don't return the value after inserting
    });

    if (error) throw error;
  } catch(error: any) {
    alert(error.message);
  }
};