import { create } from 'zustand';

const useRoadmapStore = create((set) => ({
  roadmapId: null,
  roadmapTitle: null,
  amount: null,
  setRoadmapData: ({ roadmapId, roadmapTitle, amount }) =>
    set({ roadmapId, roadmapTitle, amount }),
}));

export default useRoadmapStore;
