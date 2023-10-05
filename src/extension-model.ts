export interface ISortTypes {
  label: string;
  apiReference: string;
  isSelected: boolean;
  text: any;
}

export class ExtensionModel {
  public static readonly languages = [
    { language: "English" },
    { language: "Spanish" },
    { language: "Russian" },
    { language: "Portuguese" },
    { language: "Japanese" },
  ];

  public static readonly sortTypes: ISortTypes[] = [
    {
      label: "Relevance",
      apiReference: "relevance",
      isSelected: false,
      text: {
        english: "relevance",
        spanish: "relevancia",
        russian: "pелевантные",
        portuguese: "relevância",
        japanese: "関連",
      },
    },
    {
      label: "Newest",
      apiReference: "creation",
      isSelected: false,
      text: {
        english: "newest",
        spanish: "más reciente",
        russian: "hовые",
        portuguese: "recente",
        japanese: "新着",
      },
    },
    {
      label: "Active",
      apiReference: "activity",
      isSelected: false,
      text: {
        english: "active",
        spanish: "activo",
        russian: "tекущие",
        portuguese: "ativa",
        japanese: "アクティブ",
      },
    },
    {
      label: "Votes",
      apiReference: "votes",
      isSelected: false,
      text: {
        english: "votes",
        spanish: "votos",
        russian: "голосов",
        portuguese: "votos",
        japanese: "投票",
      },
    },
  ];
}
