export default {
  ById: <T>(items?: any[], id?: T, callback?: (item: any, index: number, items: any[]) => void) => {
    if (items) {
      for (let i = 0; i < items.length; i += 1) {
        if (items[i].id === id) {
          callback?.(items[i], i, items);
          break;
        }
      }
    }
  },
};
