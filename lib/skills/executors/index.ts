import { SkillExecutor } from "../types";
import { QUANT_EXECUTORS }        from "./quant";
import { QUANT2_EXECUTORS }       from "./quant2";
import { RESEARCH_EXECUTORS }     from "./research";
import { RESEARCH2_EXECUTORS }    from "./research2";
import { LEARNING_EXECUTORS }     from "./learning";
import { DESIGN_EXECUTORS }       from "./design";
import { KNOWLEDGE_EXECUTORS }    from "./knowledge";
import { KNOWLEDGE2_EXECUTORS }   from "./knowledge2";
import { DOCUMENT_EXECUTORS }     from "./documents";
import { NOTEBOOKLM_EXECUTORS }   from "./notebooklm";
import { makeDefaultExecutor }    from "./default";

const REGISTRY: Record<string, SkillExecutor> = {
  ...QUANT_EXECUTORS,
  ...QUANT2_EXECUTORS,
  ...RESEARCH_EXECUTORS,
  ...RESEARCH2_EXECUTORS,
  ...LEARNING_EXECUTORS,
  ...DESIGN_EXECUTORS,
  ...KNOWLEDGE_EXECUTORS,
  ...KNOWLEDGE2_EXECUTORS,
  ...DOCUMENT_EXECUTORS,
  ...NOTEBOOKLM_EXECUTORS,
};

export function getExecutor(skillId: string): SkillExecutor {
  return REGISTRY[skillId] ?? makeDefaultExecutor(skillId);
}
