<script>
  import { i18n } from "../stores/i18n.js";
  import { fade } from "svelte/transition";
  import { format, fromUnixTime } from "date-fns";

  export let comments;
  let commentsShowAmount = 5;
  $: commentsLength = comments && comments.length - commentsShowAmount - 1;

  function setDate(date) {
    const dateFromUnix = fromUnixTime(date);
    return `${$i18n.text.asked} ${format(date, "MMM dd")} '${format(
      date,
      "yy"
    )} at ${format(date, "HH:mm")}`;
  }

  function toggleComments() {
    commentsShowAmount = commentsShowAmount === 5 ? comments.length : 5;
  }
</script>

<style>
  section {
    padding-bottom: 20px;
    margin-top: 30px;
  }
  .container {
    display: table;
    border-bottom: 1px solid var(--vscode-textSeparator-foreground);
  }
  .container:last-of-type {
    border-bottom: 0;
    margin-bottom: 10px;
  }
  .container .col {
    display: table-cell;
    padding: 10px 0px 10px 10px;
  }
  .container .col:first-child {
    text-align: center;
    width: 30px;
    vertical-align: middle;
  }
  .container .col:last-child {
    text-align: left;
    word-break: keep-all;
  }
  .display-name {
    background-color: var(--vscode-textLink-foreground);
    color: var(--vscode-badge-foreground);
    padding: 0 4px 1px;
    font-size: 11px;
    word-break: keep-all;
  }
</style>

<section in:fade>

  {#each comments as comment, i}
    {#if i <= commentsShowAmount}
      <div class="container">
        <div class="col">
          <strong>
            {#if comment.score === 0}-{:else}{comment.score}{/if}
          </strong>
        </div>
        <div class="col">
          {@html comment.body}
          <i>
            &nbsp;&nbsp;–&nbsp;&nbsp
            <span class="display-name">{comment.owner.display_name}</span>
            &nbsp {setDate(comment.creation_date)}
          </i>
        </div>
      </div>
    {/if}
  {/each}

  <span on:click={toggleComments}>
    {#if comments.length > commentsShowAmount}
      {`${$i18n.text.show} ${commentsLength} ${$i18n.text.more_comments}`}
    {:else if comments.length === commentsShowAmount}
      {$i18n.text.hide_comments}
    {/if}
  </span>

</section>
