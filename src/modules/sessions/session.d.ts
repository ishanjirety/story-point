type TSession = {
  id: string;
  members: Array<{
    id: string;
    name: string;
  }>;
  activeStory: TStory;
};
type TStory = {
  id: string;
  description: string;
  votes: {
    [userId: string]: {
      id: string;
      userId: string;
      vote: number;
    };
  };
};
