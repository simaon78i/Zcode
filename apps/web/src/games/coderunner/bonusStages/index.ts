import { arraysTemplate } from "./arrays";
import { conditionalsTemplate } from "./conditionals";
import { forLoopsTemplate } from "./forLoops";
import { functionsTemplate } from "./functions";
import type { BonusRunState, BonusTemplateRuntime, BonusTopicId } from "./types";
import { variablesTemplate } from "./variables";

export const BONUS_TEMPLATE_MAP: Record<BonusTopicId, BonusTemplateRuntime> = {
  forLoops: forLoopsTemplate,
  arrays: arraysTemplate,
  variables: variablesTemplate,
  functions: functionsTemplate,
  conditionals: conditionalsTemplate,
};

export const BONUS_TOPIC_OPTIONS: { id: BonusTopicId; label: string }[] = [
  { id: "forLoops", label: "FOR LOOPS" },
  { id: "arrays", label: "ARRAYS" },
  { id: "variables", label: "VARIABLES" },
  { id: "functions", label: "FUNCTIONS" },
  { id: "conditionals", label: "CONDITIONALS" },
];

export function getBonusTemplate(topicId: BonusTopicId): BonusTemplateRuntime {
  return BONUS_TEMPLATE_MAP[topicId];
}

export type { BonusRunState };
