<script>
  import { i18n } from "../stores/i18n.js";
  import axios from "axios";
  import Comments from "../common/Comments.svelte";
  import RowLayout from "../common/RowLayout.svelte";
  import QuestionAnswerIndicies from "./QuestionAnswerIndicies.svelte";
  import User from "../common/User.svelte";
  import Tags from "../common/Tags.svelte";

  export let questionId;
  export let vscode;
  let answers;

  const baseUri = "https://api.stackexchange.com/2.2";
  const filter = "!M7iu1KROAgtzactMhHlgZ19xUsGuQJ(WdBhiYR*(Bw_PhIcdWN*FF1u"; // NB!! If this is changed PLEASE UPDATE the filters.md
  const key = "VP5SbX4dbH8MJUft7hjoaA((";
  const site = `${$i18n.code}stackoverflow`;
  const uri = `${baseUri}/questions/${questionId}/answers?order=desc&sort=votes&site=${site}&filter=${filter}&key=${key}`;

  axios.get(uri).then(response => {
    if (response.status === 200) {
      answers = response.data.items;
    } else {
      vscode.postMessage({
        command: "progress",
        action: "stop",
        error: true,
        errorMessage:
          "An error getting question. Check your internet connection."
      });
    }
  });
</script>

<style>
  .container {
    border-bottom: 2px solid var(--vscode-textSeparator-foreground);
  }
  /* Duplicate code from Questions.svelte */
  .question-answer-bottom {
    display: block;
    width: 100%;
    height: 70px;
  }
</style>

{#if answers}
  {#each answers as answer, i}
    <div class="container">
      <RowLayout>

        <div slot="left">
          <QuestionAnswerIndicies
            score={answer.score}
            isAccepted={answer.is_accepted} />
        </div>

        <div slot="right">
          <div>
            {@html answer.body}
          </div>

          {#if answer.tags}
            <Tags tags={answer.tags} />
          {/if}

          <div class="question-answer-bottom">
            <User user={answer.owner} createdDate={answer.creation_date} />
          </div>

          {#if answer.comments}
            <Comments comments={answer.comments} />
          {/if}
        </div>
      </RowLayout>
    </div>
  {/each}
{/if}
