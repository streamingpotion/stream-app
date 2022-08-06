<script lang="ts">
  import { isauthModalOpen } from "$lib/stores/authModalStore";
  import Twitch from "$lib/components/icons/Twitch.svelte";
  import Youtube from "$lib/components/icons/Youtube.svelte";
  import Button from "$lib/components/global/Button.svelte";
  import Input from "$lib/components/global/Input.svelte";
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from "svelte/transition";

  let loading: boolean = false;
  let email: string;
  let password: string;
  let error: boolean = true;

  const dispatchLogin = createEventDispatcher();

  const signInWithPlatform = (platform:string) => {
    dispatchLogin('auth', { platform: platform });
  }

  const forgotPassword = () => {

  }

  const handleInputError = (e: CustomEvent) => {
    error = e.detail.state;
  }

</script>

<div in:fade={{duration: 200, delay: 100}} out:fade={{duration: 100}}>
  <h2 class="header">Login</h2>
  <p>Login to your account to continue!</p>
  <div class="auth-form__header-icons">
    <Button on:click={() => signInWithPlatform('twitch')} square type="button" color="twitch">
      <Twitch height="24px" width="24px"/>
      <span class='icon__span'>Twitch</span>
    </Button>
    <Button on:click={() => signInWithPlatform('google')} square type="button" color="youtube">
      <Youtube height="24px" width="24px"/>
      <span class='icon__span'>YouTube</span>
    </Button>
  </div>
  <div class="auth-form__wrapper">
    <Input on:error={handleInputError} name="authEmail" type="email" placeholder="name@example.com" bind:value={email}>Email Address</Input>
    <Input on:error={handleInputError} name="authPassword" type="password" placeholder="Password" bind:value={password}>
      <span>Password</span>
      <span class="forgot">Forgot Password?</span>
    </Input>
  </div>
  <div class="auth-form__btn-wrapper">
    <Button full type="submit" color="primary" disabled={loading || error} arrow>{loading ? "loading" : "log in"}</Button>
  </div>
  <div class="auth-form__footer">
    <p>No account? <Button type="button" color="primary" link on:click={() => isauthModalOpen.set('signup')}>Sign up for Potion</Button></p>
  </div>
</div>