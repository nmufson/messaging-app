import superjson from 'superjson';
import { DateTime } from 'luxon';

superjson.registerCustom<DateTime, string>(
  {
    isApplicable: (v): v is DateTime => DateTime.isDateTime(v),
    serialize: (v) => {
      const iso = v.toISO();
      if (!iso) throw new Error('Cannot serialize invalid Luxon DateTime');
      return iso;
    },
    deserialize: (v) => DateTime.fromISO(v),
  },
  'luxon-DateTime'
);

export default superjson;
