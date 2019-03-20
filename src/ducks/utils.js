import { OrderedMap, Map } from "immutable";

export const generateId = () => {
  return Date.now();
};

export const fbDatatoEntities = (data, RecordModel = Map) => {
  return new OrderedMap(data).mapEntries(([uid, value]) => (
    [uid, new RecordModel(value).set("uid", uid)]
  ));
};
