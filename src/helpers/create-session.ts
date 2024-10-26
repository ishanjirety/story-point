import { v4 } from "uuid";

export function createNewSession(): TSession {
  return {
    id: v4(),
    members: [],
    activeStory: {
      description: "",
      id: v4(),
      votes: [],
    },
  };
}
