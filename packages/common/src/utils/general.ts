import { DateTime } from 'luxon';
import { DateRange } from 'src/schemas/primitives';

export const getDefaultDateRange = (): DateRange => {
  return {
    startDate: DateTime.now().minus({ days: 7 }),
    endDate: DateTime.now(),
  };
};
