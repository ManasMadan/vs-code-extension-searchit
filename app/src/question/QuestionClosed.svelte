<script>
  import { i18n } from "../stores/i18n.js";
  import { format, fromUnixTime } from "date-fns";
  export let details;
  export let closedDate;
  export let reason;

  const date = fromUnixTime(closedDate);
  $: atTime = `${format(date, "MMM dd")} '${format(date, "yy")} at ${format(
    date,
    "HH:mm"
  )}`;
</script>

<style>
  blockquote {
    background-color: var(--vscode-textBlockQuote-background);
    color: var(--vscode-errorForeground);
    margin: 30px 0 20px;
    border: 0;
  }
</style>

<blockquote>
  <header>
    <strong>{$i18n.text.closed}</strong>
    {$i18n.text.as}
    {@html reason}
    {$i18n.text.on} {atTime}
  </header>
  {@html details.description}
</blockquote>
